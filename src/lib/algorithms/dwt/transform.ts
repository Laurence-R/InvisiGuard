/**
 * DWT 離散小波變換核心實現
 */

import { WaveletType, DWTResult } from '@/types';
import { getWaveletFilter } from './wavelets';
import { deepCopy2DArray } from '@/lib/utils';

/**
 * 一維小波分解
 */
function dwt1D(signal: number[], filter: { lowpass: number[]; highpass: number[] }): {
  low: number[];
  high: number[];
} {
  const { lowpass, highpass } = filter;
  const length = signal.length;
  const halfLength = Math.floor(length / 2);
  
  const low: number[] = new Array(halfLength);
  const high: number[] = new Array(halfLength);
  
  for (let i = 0; i < halfLength; i++) {
    let sumLow = 0;
    let sumHigh = 0;
    
    for (let j = 0; j < lowpass.length; j++) {
      const index = (2 * i + j) % length;
      sumLow += signal[index] * lowpass[j];
      sumHigh += signal[index] * highpass[j];
    }
    
    low[i] = sumLow;
    high[i] = sumHigh;
  }
  
  return { low, high };
}

/**
 * 一維小波重建
 */
function idwt1D(low: number[], high: number[], filter: { lowpass: number[]; highpass: number[] }): number[] {
  const { lowpass, highpass } = filter;
  const length = low.length * 2;
  const signal: number[] = new Array(length).fill(0);
  
  for (let i = 0; i < low.length; i++) {
    for (let j = 0; j < lowpass.length; j++) {
      const index = (2 * i + j) % length;
      signal[index] += low[i] * lowpass[j] + high[i] * highpass[j];
    }
  }
  
  return signal;
}

/**
 * 二維 DWT 前向變換
 * @param image 輸入圖像二維數組
 * @param waveletType 小波類型
 * @returns DWT 分解結果
 */
export function dwt2D(image: number[][], waveletType: WaveletType = WaveletType.HAAR): DWTResult {
  const filter = getWaveletFilter(waveletType);
  const height = image.length;
  const width = image[0].length;
  
  // Step 1: 對每一行進行 DWT
  const rowTransformed: number[][] = [];
  for (let i = 0; i < height; i++) {
    const { low, high } = dwt1D(image[i], filter);
    rowTransformed.push([...low, ...high]);
  }
  
  // Step 2: 對每一列進行 DWT
  const colTransformed: number[][] = Array.from({ length: height }, () => 
    new Array(width).fill(0)
  );
  
  for (let j = 0; j < width; j++) {
    const column = rowTransformed.map(row => row[j]);
    const { low, high } = dwt1D(column, filter);
    
    for (let i = 0; i < low.length; i++) {
      colTransformed[i][j] = low[i];
    }
    for (let i = 0; i < high.length; i++) {
      colTransformed[i + low.length][j] = high[i];
    }
  }
  
  // 分割四個子帶
  const halfHeight = Math.floor(height / 2);
  const halfWidth = Math.floor(width / 2);
  
  const ll: number[][] = [];
  const lh: number[][] = [];
  const hl: number[][] = [];
  const hh: number[][] = [];
  
  for (let i = 0; i < halfHeight; i++) {
    ll.push(colTransformed[i].slice(0, halfWidth));
    lh.push(colTransformed[i].slice(halfWidth, width));
    hl.push(colTransformed[i + halfHeight].slice(0, halfWidth));
    hh.push(colTransformed[i + halfHeight].slice(halfWidth, width));
  }
  
  return { ll, lh, hl, hh, level: 1 };
}

/**
 * 二維 DWT 反向變換
 * @param dwtResult DWT 分解結果
 * @param waveletType 小波類型
 * @returns 重建的圖像
 */
export function idwt2D(dwtResult: DWTResult, waveletType: WaveletType = WaveletType.HAAR): number[][] {
  const filter = getWaveletFilter(waveletType);
  const { ll, lh, hl, hh } = dwtResult;
  
  const halfHeight = ll.length;
  const halfWidth = ll[0].length;
  const height = halfHeight * 2;
  const width = halfWidth * 2;
  
  // 重組四個子帶
  const combined: number[][] = Array.from({ length: height }, () => 
    new Array(width).fill(0)
  );
  
  for (let i = 0; i < halfHeight; i++) {
    for (let j = 0; j < halfWidth; j++) {
      combined[i][j] = ll[i][j];
      combined[i][j + halfWidth] = lh[i][j];
      combined[i + halfHeight][j] = hl[i][j];
      combined[i + halfHeight][j + halfWidth] = hh[i][j];
    }
  }
  
  // Step 1: 對每一列進行 IDWT
  const colReconstructed: number[][] = Array.from({ length: height }, () => 
    new Array(width).fill(0)
  );
  
  for (let j = 0; j < width; j++) {
    const column = combined.map(row => row[j]);
    const low = column.slice(0, halfHeight);
    const high = column.slice(halfHeight, height);
    const reconstructed = idwt1D(low, high, filter);
    
    for (let i = 0; i < height; i++) {
      colReconstructed[i][j] = reconstructed[i];
    }
  }
  
  // Step 2: 對每一行進行 IDWT
  const result: number[][] = [];
  for (let i = 0; i < height; i++) {
    const row = colReconstructed[i];
    const low = row.slice(0, halfWidth);
    const high = row.slice(halfWidth, width);
    const reconstructed = idwt1D(low, high, filter);
    result.push(reconstructed);
  }
  
  return result;
}

/**
 * 多層級 DWT 分解
 * @param image 輸入圖像
 * @param levels 分解層數
 * @param waveletType 小波類型
 * @returns 多層級 DWT 結果數組
 */
export function dwtMultiLevel(
  image: number[][],
  levels: number,
  waveletType: WaveletType = WaveletType.HAAR
): DWTResult[] {
  const results: DWTResult[] = [];
  let currentImage = deepCopy2DArray(image);
  
  for (let level = 1; level <= levels; level++) {
    const result = dwt2D(currentImage, waveletType);
    result.level = level;
    results.push(result);
    
    // 下一層只對 LL 子帶繼續分解
    currentImage = result.ll;
  }
  
  return results;
}

/**
 * 多層級 DWT 重建
 * @param results 多層級 DWT 結果
 * @param waveletType 小波類型
 * @returns 重建的圖像
 */
export function idwtMultiLevel(
  results: DWTResult[],
  waveletType: WaveletType = WaveletType.HAAR
): number[][] {
  let reconstructed = results[results.length - 1].ll;
  
  // 從最深層開始重建
  for (let i = results.length - 1; i >= 0; i--) {
    const currentResult = { ...results[i], ll: reconstructed };
    reconstructed = idwt2D(currentResult, waveletType);
  }
  
  return reconstructed;
}
