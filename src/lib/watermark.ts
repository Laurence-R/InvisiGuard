/**
 * 完整的浮水印處理流程
 */

import {
  WaveletType,
  SubBand,
  EmbedParams,
  ExtractParams,
  ProcessResult,
  QualityMetrics,
} from '@/types';
import {
  loadImageFromFile,
  imageToImageData,
  imageDataToBlob,
  imageDataToYUV,
  yuvToImageData,
  imageDataToGrayscale2D,
  grayscale2DToImageData,
} from '@/lib/image/loader';
import { padToPowerOfTwo, removePadding } from '@/lib/image/processor';
import { dwtMultiLevel, idwtMultiLevel } from '@/lib/algorithms/dwt/transform';
import { prepareWatermark, qimEmbed, calculateCapacity } from '@/lib/algorithms/qim/embed';
import { qimExtract, calculateConfidence } from '@/lib/algorithms/qim/extract';
import { calculatePSNR, calculateSSIM, deepCopy2DArray } from '@/lib/utils';

/**
 * 驗證嵌入參數
 */
function validateEmbedParams(params: EmbedParams, imageWidth: number, imageHeight: number): void {
  // 檢查量化步長
  if (params.quantizationStep <= 0) {
    throw new Error('量化步長必須大於 0');
  }
  if (params.quantizationStep > 255) {
    throw new Error('量化步長不應超過 255');
  }
  
  // 檢查分解層級
  if (params.decompositionLevel < 1) {
    throw new Error('分解層級必須至少為 1');
  }
  
  // 檢查圖像尺寸是否支援指定的分解層級
  const minDimension = Math.min(imageWidth, imageHeight);
  const maxLevel = Math.floor(Math.log2(minDimension));
  if (params.decompositionLevel > maxLevel) {
    throw new Error(`圖像尺寸 (${imageWidth}x${imageHeight}) 最多支援 ${maxLevel} 層分解，您選擇了 ${params.decompositionLevel} 層`);
  }
  
  // 檢查嵌入強度
  if (params.embedStrength < 0 || params.embedStrength > 1) {
    throw new Error('嵌入強度必須在 0-1 之間');
  }
}

/**
 * 驗證提取參數
 */
function validateExtractParams(params: ExtractParams, imageWidth: number, imageHeight: number): void {
  // 檢查量化步長
  if (params.quantizationStep <= 0) {
    throw new Error('量化步長必須大於 0');
  }
  
  // 檢查分解層級
  if (params.decompositionLevel < 1) {
    throw new Error('分解層級必須至少為 1');
  }
  
  // 檢查圖像尺寸
  const minDimension = Math.min(imageWidth, imageHeight);
  const maxLevel = Math.floor(Math.log2(minDimension));
  if (params.decompositionLevel > maxLevel) {
    throw new Error(`圖像尺寸 (${imageWidth}x${imageHeight}) 最多支援 ${maxLevel} 層分解`);
  }
}

/**
 * 浮水印嵌入主流程
 */
export async function embedWatermark(
  imageFile: File,
  watermarkMessage: string,
  params: EmbedParams
): Promise<ProcessResult> {
  try {
    // 驗證訊息不為空
    if (!watermarkMessage || watermarkMessage.trim().length === 0) {
      throw new Error('浮水印訊息不能為空');
    }
    
    // 1. 載入圖像
    const img = await loadImageFromFile(imageFile);
    let imageData = imageToImageData(img);
    
    // 驗證參數
    validateEmbedParams(params, imageData.width, imageData.height);
    
    // 2. 填充到 2 的冪次方
    const { paddedImage, originalWidth, originalHeight } = padToPowerOfTwo(imageData);
    imageData = paddedImage;
    
    // 3. 轉換色彩空間並提取 Y 通道
    const { y: yChannel, u: uChannel, v: vChannel } = imageDataToYUV(imageData);
    const originalY = deepCopy2DArray(yChannel);
    
    // 4. 執行多層級 DWT
    const dwtResults = dwtMultiLevel(
      yChannel,
      params.decompositionLevel,
      params.waveletType
    );
    
    // 5. 檢查嵌入容量
    const capacity = calculateCapacity(
      yChannel[0].length,
      yChannel.length,
      params.decompositionLevel
    );
    
    const watermarkData = prepareWatermark(watermarkMessage);
    if (watermarkData.binary.length > capacity) {
      return {
        success: false,
        error: `浮水印太長！容量：${capacity} bits，需要：${watermarkData.binary.length} bits`,
      };
    }
    
    // 6. 選擇要嵌入的頻帶
    const targetLevel = dwtResults[params.decompositionLevel - 1];
    let coefficients: number[][] = targetLevel.hl;
    
    switch (params.embedBand) {
      case SubBand.LL:
        coefficients = targetLevel.ll;
        break;
      case SubBand.LH:
        coefficients = targetLevel.lh;
        break;
      case SubBand.HL:
        coefficients = targetLevel.hl;
        break;
      case SubBand.HH:
        coefficients = targetLevel.hh;
        break;
    }
    
    // 7. QIM 嵌入
    const embeddedCoeffs = qimEmbed(
      coefficients,
      watermarkData,
      params.quantizationStep
    );
    
    // 8. 更新係數
    switch (params.embedBand) {
      case SubBand.LL:
        targetLevel.ll = embeddedCoeffs;
        break;
      case SubBand.LH:
        targetLevel.lh = embeddedCoeffs;
        break;
      case SubBand.HL:
        targetLevel.hl = embeddedCoeffs;
        break;
      case SubBand.HH:
        targetLevel.hh = embeddedCoeffs;
        break;
    }
    
    // 9. 執行逆 DWT
    const reconstructedY = idwtMultiLevel(dwtResults, params.waveletType);
    
    // 10. 計算品質指標
    const psnr = calculatePSNR(originalY, reconstructedY);
    const ssim = calculateSSIM(originalY, reconstructedY);
    
    // 11. 轉換回 RGB
    let watermarkedImageData = yuvToImageData(reconstructedY, uChannel, vChannel);
    
    // 12. 移除填充
    watermarkedImageData = removePadding(watermarkedImageData, originalWidth, originalHeight);
    
    // 13. 轉換為 Blob
    const blob = await imageDataToBlob(watermarkedImageData, 'image/png');
    
    return {
      success: true,
      imageData: watermarkedImageData,
      metrics: {
        psnr,
        ssim,
        mse: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 浮水印提取主流程
 */
export async function extractWatermark(
  imageFile: File,
  params: ExtractParams,
  originalFile?: File
): Promise<ProcessResult> {
  try {
    // 1. 載入含浮水印的圖像
    const img = await loadImageFromFile(imageFile);
    let imageData = imageToImageData(img);
    
    // 驗證參數
    validateExtractParams(params, imageData.width, imageData.height);
    
    // 2. 填充到 2 的冪次方
    const { paddedImage } = padToPowerOfTwo(imageData);
    imageData = paddedImage;
    
    // 3. 轉換色彩空間並提取 Y 通道
    const { y: yChannel } = imageDataToYUV(imageData);
    
    // 4. 執行多層級 DWT
    const dwtResults = dwtMultiLevel(
      yChannel,
      params.decompositionLevel,
      params.waveletType
    );
    
    // 5. 選擇提取的頻帶
    const targetLevel = dwtResults[params.decompositionLevel - 1];
    let coefficients: number[][] = targetLevel.hl;
    
    switch (params.embedBand) {
      case SubBand.LL:
        coefficients = targetLevel.ll;
        break;
      case SubBand.LH:
        coefficients = targetLevel.lh;
        break;
      case SubBand.HL:
        coefficients = targetLevel.hl;
        break;
      case SubBand.HH:
        coefficients = targetLevel.hh;
        break;
    }
    
    // 6. QIM 提取
    const extractedWatermark = qimExtract(coefficients, params.quantizationStep);
    
    // 7. 計算置信度
    const confidence = calculateConfidence(extractedWatermark.binary);
    
    return {
      success: true,
      watermark: extractedWatermark.message,
      metrics: {
        psnr: 0,
        ssim: confidence,
        mse: 0,
        ber: 1 - confidence,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 獲取默認參數
 */
export function getDefaultEmbedParams(): EmbedParams {
  return {
    waveletType: WaveletType.HAAR,
    decompositionLevel: 2,
    embedBand: SubBand.HL,
    quantizationStep: 50,
    embedStrength: 0.5,
  };
}

export function getDefaultExtractParams(): ExtractParams {
  return {
    waveletType: WaveletType.HAAR,
    decompositionLevel: 2,
    embedBand: SubBand.HL,
    quantizationStep: 50,
  };
}
