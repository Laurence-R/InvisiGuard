/**
 * QIM 量化索引調變 - 浮水印嵌入
 */

import { WatermarkData } from '@/types';
import { stringToBinary } from '@/lib/utils';

/**
 * QIM 嵌入核心函數
 * @param coefficients 小波係數
 * @param watermark 浮水印數據
 * @param quantizationStep 量化步長
 * @returns 修改後的係數
 */
export function qimEmbed(
  coefficients: number[][],
  watermark: WatermarkData,
  quantizationStep: number
): number[][] {
  const height = coefficients.length;
  const width = coefficients[0].length;
  const binary = watermark.binary;
  const embedded: number[][] = coefficients.map(row => [...row]);
  
  let bitIndex = 0;
  const totalBits = binary.length;
  
  // 選擇中頻係數進行嵌入（跳過前幾個係數）
  const skipCoeffs = Math.floor(Math.min(height, width) * 0.1);
  
  for (let i = skipCoeffs; i < height && bitIndex < totalBits; i++) {
    for (let j = skipCoeffs; j < width && bitIndex < totalBits; j++) {
      const coeff = coefficients[i][j];
      const bit = binary[bitIndex];
      
      // QIM 嵌入
      embedded[i][j] = quantize(coeff, bit, quantizationStep);
      bitIndex++;
    }
  }
  
  return embedded;
}

/**
 * QIM 量化函數
 * @param value 原始值
 * @param bit 要嵌入的位元 (0 或 1)
 * @param step 量化步長
 * @returns 量化後的值
 */
function quantize(value: number, bit: number, step: number): number {
  const halfStep = step / 2;
  
  if (bit === 0) {
    // 量化到偶數倍
    const q = Math.round(value / step);
    return q * step;
  } else {
    // 量化到奇數倍
    const q = Math.floor(value / step);
    return q * step + halfStep;
  }
}

/**
 * 準備浮水印數據
 * @param message 浮水印訊息
 * @returns 浮水印數據對象
 */
export function prepareWatermark(message: string): WatermarkData {
  const binary = stringToBinary(message);
  
  // 添加長度信息（前32位）
  const lengthBits: number[] = [];
  for (let i = 31; i >= 0; i--) {
    lengthBits.push((binary.length >> i) & 1);
  }
  
  return {
    message,
    binary: [...lengthBits, ...binary],
    length: binary.length,
  };
}

/**
 * 計算嵌入容量
 * @param width 圖像寬度
 * @param height 圖像高度
 * @param levels DWT 分解層數
 * @returns 可嵌入的位元數
 */
export function calculateCapacity(
  width: number,
  height: number,
  levels: number
): number {
  // 計算最後一層的係數數量
  const finalWidth = Math.floor(width / Math.pow(2, levels));
  const finalHeight = Math.floor(height / Math.pow(2, levels));
  
  // 扣除跳過的係數
  const skipCoeffs = Math.floor(Math.min(finalHeight, finalWidth) * 0.1);
  const availableCoeffs = (finalHeight - skipCoeffs) * (finalWidth - skipCoeffs);
  
  // 扣除長度信息佔用的32位
  return Math.max(0, availableCoeffs - 32);
}

/**
 * 自適應調整量化步長
 * @param coefficients 小波係數
 * @param targetStrength 目標嵌入強度 (0-1)
 * @returns 建議的量化步長
 */
export function adaptiveQuantizationStep(
  coefficients: number[][],
  targetStrength: number = 0.5
): number {
  // 計算係數的標準差
  const flat = coefficients.flat();
  const mean = flat.reduce((sum, val) => sum + Math.abs(val), 0) / flat.length;
  
  const variance = flat.reduce((sum, val) => {
    const diff = Math.abs(val) - mean;
    return sum + diff * diff;
  }, 0) / flat.length;
  
  const stdDev = Math.sqrt(variance);
  
  // 基於標準差和目標強度計算量化步長
  const baseStep = stdDev * 0.1;
  return baseStep * (0.5 + targetStrength);
}
