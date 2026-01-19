import { 
  WorkerMessage, 
  WorkerResponse 
} from '@/types/worker';
import { 
  imageDataToYUV, 
  yuvToImageData, 
  imageDataToGrayscale2D
} from '@/lib/image/loader';
import { 
  padToPowerOfTwo, 
  removePadding 
} from '@/lib/image/processor';
import { 
  dwtMultiLevel, 
  idwtMultiLevel 
} from '@/lib/algorithms/dwt/transform';
import { 
  prepareWatermark, 
  qimEmbed 
} from '@/lib/algorithms/qim/embed';
import { 
  qimExtract, 
  calculateConfidence 
} from '@/lib/algorithms/qim/extract';
import { 
  calculatePSNR,
  calculateMSE,
  deepCopy2DArray 
} from '@/lib/utils';
import { SubBand, WaveletType } from '@/types';

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    if (type === 'EMBED') {
      const { imageData, watermarkText, params, fileId } = payload;
      
      // 1. Prepare (Pad)
      const { paddedImage, originalWidth, originalHeight } = padToPowerOfTwo(imageData);
      
      // 2. Convert to YUV
      const { y: yChannel, u: uChannel, v: vChannel } = imageDataToYUV(paddedImage);
      
      // 3. DWT
      const dwtResults = dwtMultiLevel(
        yChannel, 
        params.decompositionLevel, 
        params.waveletType || WaveletType.HAAR
      );
      
      // 4. Prepare Message
      const watermarkData = prepareWatermark(watermarkText);
      
      // 5. Select Band
      const targetResultIndex = params.decompositionLevel - 1;
      if (targetResultIndex >= dwtResults.length) {
          throw new Error('Invalid decomposition level');
      }
      const targetLevel = dwtResults[targetResultIndex];
      let coefficients: number[][] | undefined;
      
      switch (params.embedBand) {
        case SubBand.LL: coefficients = targetLevel.ll; break;
        case SubBand.LH: coefficients = targetLevel.lh; break;
        case SubBand.HL: coefficients = targetLevel.hl; break;
        case SubBand.HH: coefficients = targetLevel.hh; break;
        default: coefficients = targetLevel.hl;
      }

      if (!coefficients) throw new Error('Failed to select frequency band');

      // 6. Embed (QIM)
      const embedK = params.quantizationStep;
      
      const embeddedCoeffs = qimEmbed(
        coefficients,
        watermarkData,
        embedK
      );
      
      // Update DWT Results
      switch (params.embedBand) {
        case SubBand.LL: targetLevel.ll = embeddedCoeffs; break;
        case SubBand.LH: targetLevel.lh = embeddedCoeffs; break;
        case SubBand.HL: targetLevel.hl = embeddedCoeffs; break;
        case SubBand.HH: targetLevel.hh = embeddedCoeffs; break;
      }
      
      dwtResults[targetResultIndex] = targetLevel;

      // 7. IDWT
      const watermarkedY = idwtMultiLevel(dwtResults, params.waveletType || WaveletType.HAAR);
      
      // 8. Merge back to RGB
      let resultImageData = yuvToImageData(watermarkedY, uChannel, vChannel);
      
      // 9. Remove Padding
      resultImageData = removePadding(resultImageData, originalWidth, originalHeight);
      
      // 10. Calculate Metrics
      const finalGray = imageDataToGrayscale2D(resultImageData);
      const originalGray = imageDataToGrayscale2D(imageData);
      const mse = calculateMSE(originalGray, finalGray);
      const psnr = calculatePSNR(originalGray, finalGray);
      
      const response: WorkerResponse = {
        type: 'EMBED_SUCCESS',
        payload: {
          imageData: resultImageData,
          metrics: { psnr, mse, ssim: 0 },
          fileId
        }
      };
      
      self.postMessage(response);
      
    } else if (type === 'EXTRACT') {
      const { imageData, params, fileId } = payload;
      
      // 1. Pad
      const { paddedImage } = padToPowerOfTwo(imageData);
      
      // 2. YUV
      const { y: yChannel } = imageDataToYUV(paddedImage);
      
      // 3. DWT
      const dwtResults = dwtMultiLevel(
        yChannel, 
        params.decompositionLevel, 
        params.waveletType || WaveletType.HAAR
      );
      
      // 4. Select Band
       const targetResultIndex = params.decompositionLevel - 1;
       if (targetResultIndex >= dwtResults.length) {
          throw new Error('Invalid decomposition level');
       }
       const targetLevel = dwtResults[targetResultIndex];
       let coefficients: number[][] | undefined;
       
       switch (params.embedBand) {
         case SubBand.LL: coefficients = targetLevel.ll; break;
         case SubBand.LH: coefficients = targetLevel.lh; break;
         case SubBand.HL: coefficients = targetLevel.hl; break;
         case SubBand.HH: coefficients = targetLevel.hh; break;
         default: coefficients = targetLevel.hl;
       }

       if (!coefficients) throw new Error('Failed to select frequency band');
      
      // 5. Extract
      const extractedWatermark = qimExtract(
        coefficients,
        params.quantizationStep
      );
      
      // 6. Confidence
      const confidence = calculateConfidence(extractedWatermark.binary);
      
      self.postMessage({
        type: 'EXTRACT_SUCCESS',
        payload: { 
            text: extractedWatermark.message, 
            confidence,
            fileId 
        }
      });
    }
  } catch (error: any) {
    self.postMessage({
      type: 'ERROR',
      payload: { error: error.message || 'Worker processing failed', fileId: payload.fileId }
    });
  }
};
