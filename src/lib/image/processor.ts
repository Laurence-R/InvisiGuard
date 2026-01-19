/**
 * 圖像處理工具
 */

/**
 * 調整圖像大小
 */
export function resizeImage(
  imageData: ImageData,
  newWidth: number,
  newHeight: number
): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // 創建臨時 canvas 放原圖
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Failed to get temp canvas context');
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // 調整大小
  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
  
  return ctx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * 添加高斯噪聲
 */
export function addGaussianNoise(
  imageData: ImageData,
  sigma: number = 10
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  
  for (let i = 0; i < result.data.length; i += 4) {
    const noise = gaussianRandom() * sigma;
    result.data[i] = clamp(result.data[i] + noise);
    result.data[i + 1] = clamp(result.data[i + 1] + noise);
    result.data[i + 2] = clamp(result.data[i + 2] + noise);
    // Alpha channel unchanged
  }
  
  return result;
}

/**
 * 高斯隨機數生成（Box-Muller 變換）
 */
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * 限制值在 0-255 範圍內
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * JPEG 壓縮模擬
 */
export async function jpegCompress(
  imageData: ImageData,
  quality: number = 0.75
): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.putImageData(imageData, 0, 0);
  
  // 轉換為 JPEG blob 再轉回來
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
      'image/jpeg',
      quality
    );
  });
  
  // 載入壓縮後的圖像
  const img = await createImageBitmap(blob);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * 裁剪圖像 (Pure JS implementation for Worker compatibility)
 */
export function cropImage(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): ImageData {
  const result = new ImageData(width, height);
  const src = imageData.data;
  const dest = result.data;
  const srcWidth = imageData.width;

  for (let row = 0; row < height; row++) {
    if (y + row >= imageData.height) break;
    
    const srcRowStart = ((y + row) * srcWidth + x) * 4;
    const destRowStart = (row * width) * 4;
    const itemsToCopy = width * 4;

    // Boundary check for x
    if (x + width > srcWidth) {
        // Copy what we can
       const validLength = (srcWidth - x) * 4;
       dest.set(src.subarray(srcRowStart, srcRowStart + validLength), destRowStart);
    } else {
       dest.set(src.subarray(srcRowStart, srcRowStart + itemsToCopy), destRowStart);
    }
  }
  return result;
}

/**
 * 旋轉圖像
 */
export function rotateImage(
  imageData: ImageData,
  angle: number
): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // 計算旋轉後的畫布大小
  const radians = (angle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const newWidth = imageData.width * cos + imageData.height * sin;
  const newHeight = imageData.width * sin + imageData.height * cos;
  
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  // 創建臨時 canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Failed to get temp canvas context');
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // 旋轉
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(tempCanvas, -imageData.width / 2, -imageData.height / 2);
  
  return ctx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * 計算圖像直方圖
 */
export function calculateHistogram(imageData: ImageData): {
  r: number[];
  g: number[];
  b: number[];
  gray: number[];
} {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const gray = new Array(256).fill(0);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    r[imageData.data[i]]++;
    g[imageData.data[i + 1]]++;
    b[imageData.data[i + 2]]++;
    
    const grayValue = Math.round(
      0.299 * imageData.data[i] +
      0.587 * imageData.data[i + 1] +
      0.114 * imageData.data[i + 2]
    );
    gray[grayValue]++;
  }
  
  return { r, g, b, gray };
}

/**
 * 確保圖像尺寸是 2 的冪次方（DWT 要求）- Updated for Worker Compatibility
 */
export function padToPowerOfTwo(imageData: ImageData): {
  paddedImage: ImageData;
  originalWidth: number;
  originalHeight: number;
} {
  const originalWidth = imageData.width;
  const originalHeight = imageData.height;
  
  const newWidth = Math.pow(2, Math.ceil(Math.log2(originalWidth)));
  const newHeight = Math.pow(2, Math.ceil(Math.log2(originalHeight)));
  
  if (newWidth === originalWidth && newHeight === originalHeight) {
    return {
      paddedImage: imageData,
      originalWidth,
      originalHeight,
    };
  }
  
  const paddedImage = new ImageData(newWidth, newHeight);
  // Fill with white (255) to match previous behavior
  // new ImageData is initialized to transparent black (0,0,0,0).
  // We set everything to 255.
  paddedImage.data.fill(255);

  const src = imageData.data;
  const dest = paddedImage.data;

  // Copy original image data
  for (let row = 0; row < originalHeight; row++) {
    const srcStart = (row * originalWidth) * 4;
    const destStart = (row * newWidth) * 4;
    // Copy a full row
    dest.set(src.subarray(srcStart, srcStart + originalWidth * 4), destStart);
  }
  
  return {
    paddedImage,
    originalWidth,
    originalHeight,
  };
}

/**
 * 移除填充，恢復原始尺寸
 */
export function removePadding(
  imageData: ImageData,
  originalWidth: number,
  originalHeight: number
): ImageData {
  if (imageData.width === originalWidth && imageData.height === originalHeight) {
    return imageData;
  }
  
  return cropImage(imageData, 0, 0, originalWidth, originalHeight);
}
