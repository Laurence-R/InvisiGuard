/**
 * 工具函數庫
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind CSS 類名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 將字符串轉換為二進制數組
 */
export function stringToBinary(str: string): number[] {
  const binary: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      binary.push((charCode >> j) & 1);
    }
  }
  return binary;
}

/**
 * 將二進制數組轉換為字符串
 */
export function binaryToString(binary: number[]): string {
  let str = '';
  for (let i = 0; i < binary.length; i += 8) {
    let charCode = 0;
    for (let j = 0; j < 8; j++) {
      charCode = (charCode << 1) | (binary[i + j] || 0);
    }
    if (charCode === 0) break; // 遇到結束符
    str += String.fromCharCode(charCode);
  }
  return str;
}

/**
 * 深拷貝二維數組
 */
export function deepCopy2DArray(arr: number[][]): number[][] {
  return arr.map(row => [...row]);
}

/**
 * 計算均方誤差 (MSE)
 */
export function calculateMSE(original: number[][], modified: number[][]): number {
  const height = original.length;
  const width = original[0].length;
  let sum = 0;
  
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const diff = original[i][j] - modified[i][j];
      sum += diff * diff;
    }
  }
  
  return sum / (height * width);
}

/**
 * 計算峰值信噪比 (PSNR)
 */
export function calculatePSNR(original: number[][], modified: number[][]): number {
  const mse = calculateMSE(original, modified);
  if (mse === 0) return Infinity;
  
  const maxPixelValue = 255;
  return 10 * Math.log10((maxPixelValue * maxPixelValue) / mse);
}

/**
 * 計算位元錯誤率 (BER)
 */
export function calculateBER(original: number[], extracted: number[]): number {
  let errors = 0;
  const length = Math.min(original.length, extracted.length);
  
  for (let i = 0; i < length; i++) {
    if (original[i] !== extracted[i]) {
      errors++;
    }
  }
  
  return errors / length;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 延遲執行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 計算結構相似性指數 (SSIM)
 * 用於評估兩個圖像的結構相似度
 */
export function calculateSSIM(original: number[][], modified: number[][]): number {
  const height = original.length;
  const width = original[0].length;
  
  // SSIM 常數
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  
  // 計算均值
  let meanOriginal = 0;
  let meanModified = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      meanOriginal += original[i][j];
      meanModified += modified[i][j];
    }
  }
  meanOriginal /= (height * width);
  meanModified /= (height * width);
  
  // 計算變異數和協方差
  let varianceOriginal = 0;
  let varianceModified = 0;
  let covariance = 0;
  
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const diffOriginal = original[i][j] - meanOriginal;
      const diffModified = modified[i][j] - meanModified;
      
      varianceOriginal += diffOriginal * diffOriginal;
      varianceModified += diffModified * diffModified;
      covariance += diffOriginal * diffModified;
    }
  }
  
  varianceOriginal /= (height * width - 1);
  varianceModified /= (height * width - 1);
  covariance /= (height * width - 1);
  
  // 計算 SSIM
  const numerator = (2 * meanOriginal * meanModified + C1) * (2 * covariance + C2);
  const denominator = (meanOriginal ** 2 + meanModified ** 2 + C1) * (varianceOriginal + varianceModified + C2);
  
  return numerator / denominator;
}
