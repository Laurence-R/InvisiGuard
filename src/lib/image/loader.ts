/**
 * 圖像載入與格式轉換
 */

import { ColorSpace } from '@/types';

/**
 * 從 File 對象載入圖像
 */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * 將圖像繪製到 Canvas 並獲取 ImageData
 */
export function imageToImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * 將 ImageData 轉換為 Blob
 */
export async function imageDataToBlob(
  imageData: ImageData,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 1.0
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * 將 ImageData 轉換為二維數組（灰階）
 */
export function imageDataToGrayscale2D(imageData: ImageData): number[][] {
  const { width, height, data } = imageData;
  const result: number[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // 轉換為灰階（使用標準權重）
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      row.push(gray);
    }
    result.push(row);
  }
  
  return result;
}

/**
 * 將二維數組（灰階）轉換回 ImageData
 */
export function grayscale2DToImageData(
  gray: number[][],
  originalImageData?: ImageData
): ImageData {
  const height = gray.length;
  const width = gray[0].length;
  
  const imageData = originalImageData || 
    new ImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const value = Math.max(0, Math.min(255, Math.round(gray[y][x])));
      
      imageData.data[idx] = value;     // R
      imageData.data[idx + 1] = value; // G
      imageData.data[idx + 2] = value; // B
      imageData.data[idx + 3] = originalImageData?.data[idx + 3] || 255; // A
    }
  }
  
  return imageData;
}

/**
 * RGB 轉 YUV
 */
export function rgbToYuv(r: number, g: number, b: number): [number, number, number] {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const u = -0.14713 * r - 0.28886 * g + 0.436 * b;
  const v = 0.615 * r - 0.51499 * g - 0.10001 * b;
  return [y, u, v];
}

/**
 * YUV 轉 RGB
 */
export function yuvToRgb(y: number, u: number, v: number): [number, number, number] {
  const r = y + 1.13983 * v;
  const g = y - 0.39465 * u - 0.58060 * v;
  const b = y + 2.03211 * u;
  return [
    Math.max(0, Math.min(255, Math.round(r))),
    Math.max(0, Math.min(255, Math.round(g))),
    Math.max(0, Math.min(255, Math.round(b))),
  ];
}

/**
 * ImageData 轉 YUV 通道
 */
export function imageDataToYUV(imageData: ImageData): {
  y: number[][];
  u: number[][];
  v: number[][];
} {
  const { width, height, data } = imageData;
  const y: number[][] = [];
  const u: number[][] = [];
  const v: number[][] = [];
  
  for (let row = 0; row < height; row++) {
    const yRow: number[] = [];
    const uRow: number[] = [];
    const vRow: number[] = [];
    
    for (let col = 0; col < width; col++) {
      const idx = (row * width + col) * 4;
      const [yVal, uVal, vVal] = rgbToYuv(
        data[idx],
        data[idx + 1],
        data[idx + 2]
      );
      
      yRow.push(yVal);
      uRow.push(uVal);
      vRow.push(vVal);
    }
    
    y.push(yRow);
    u.push(uRow);
    v.push(vRow);
  }
  
  return { y, u, v };
}

/**
 * YUV 通道轉 ImageData
 */
export function yuvToImageData(
  y: number[][],
  u: number[][],
  v: number[][],
  alpha?: number[][]
): ImageData {
  const height = y.length;
  const width = y[0].length;
  const imageData = new ImageData(width, height);
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = (row * width + col) * 4;
      const [r, g, b] = yuvToRgb(y[row][col], u[row][col], v[row][col]);
      
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = alpha?.[row]?.[col] || 255;
    }
  }
  
  return imageData;
}

/**
 * 下載圖像
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
