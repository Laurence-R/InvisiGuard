/**
 * QIM 量化索引調變 - 浮水印提取
 */

import { WatermarkData } from '@/types';
import { binaryToString } from '@/lib/utils';

/**
 * QIM 提取核心函數
 * @param coefficients 含浮水印的小波係數
 * @param quantizationStep 量化步長
 * @param expectedLength 期望的浮水印長度（可選）
 * @returns 提取的浮水印數據
 */
export function qimExtract(
  coefficients: number[][],
  quantizationStep: number,
  expectedLength?: number
): WatermarkData {
  const height = coefficients.length;
  const width = coefficients[0].length;
  const binary: number[] = [];
  
  // 跳過前幾個係數（與嵌入時一致）
  const skipCoeffs = Math.floor(Math.min(height, width) * 0.1);
  
  // 首先提取長度信息（前32位）
  let bitCount = 0;
  let maxBits = 32 + (expectedLength || (height * width));
  
  for (let i = skipCoeffs; i < height && bitCount < maxBits; i++) {
    for (let j = skipCoeffs; j < width && bitCount < maxBits; j++) {
      const coeff = coefficients[i][j];
      const bit = dequantize(coeff, quantizationStep);
      binary.push(bit);
      bitCount++;
      
      // 如果已經提取了長度信息，解析它
      if (bitCount === 32 && !expectedLength) {
        let length = 0;
        for (let k = 0; k < 32; k++) {
          length = (length << 1) | binary[k];
        }
        // 更新最大位元數
        maxBits = 32 + length;
      }
    }
  }
  
  // 提取長度信息
  let messageLength = 0;
  if (expectedLength) {
    messageLength = expectedLength;
  } else {
    for (let i = 0; i < 32; i++) {
      messageLength = (messageLength << 1) | binary[i];
    }
  }
  
  // 提取訊息位元
  const messageBits = binary.slice(32, 32 + messageLength);
  const message = binaryToString(messageBits);
  
  return {
    message,
    binary: messageBits,
    length: messageLength,
  };
}

/**
 * QIM 反量化函數
 * @param value 量化後的值
 * @param step 量化步長
 * @returns 提取的位元 (0 或 1)
 */
function dequantize(value: number, step: number): number {
  const remainder = Math.abs(value) % step;
  
  // 判斷是偶數倍還是奇數倍
  // 偶數倍位於 0 (或 step) 附近
  // 奇數倍位於 step/2 附近
  // 如果餘數在 [step/4, 3*step/4] 範圍內，則判定為奇數倍（Bit 1）
  if (remainder >= step / 4 && remainder < step * 3 / 4) {
    return 1; // 奇數倍
  } else {
    return 0; // 偶數倍
  }
}

/**
 * 盲提取（不需要原始圖像）
 * @param coefficients 含浮水印的係數
 * @param quantizationStep 量化步長
 * @returns 提取的浮水印數據
 */
export function blindExtract(
  coefficients: number[][],
  quantizationStep: number
): WatermarkData {
  return qimExtract(coefficients, quantizationStep);
}

/**
 * 半盲提取（需要原始圖像的係數作為參考）
 * @param watermarkedCoeffs 含浮水印的係數
 * @param originalCoeffs 原始係數
 * @param quantizationStep 量化步長
 * @returns 提取的浮水印數據
 */
export function semiBlindExtract(
  watermarkedCoeffs: number[][],
  originalCoeffs: number[][],
  quantizationStep: number
): WatermarkData {
  const height = watermarkedCoeffs.length;
  const width = watermarkedCoeffs[0].length;
  const binary: number[] = [];
  
  const skipCoeffs = Math.floor(Math.min(height, width) * 0.1);
  
  // 提取長度信息
  for (let i = skipCoeffs; i < height && binary.length < 32; i++) {
    for (let j = skipCoeffs; j < width && binary.length < 32; j++) {
      const watermarked = watermarkedCoeffs[i][j];
      const bit = dequantize(watermarked, quantizationStep);
      binary.push(bit);
    }
  }
  
  let messageLength = 0;
  for (let i = 0; i < 32; i++) {
    messageLength = (messageLength << 1) | binary[i];
  }
  
  // 提取訊息位元（使用差分提高準確性）
  const messageBits: number[] = [];
  let bitCount = 0;
  
  for (let i = skipCoeffs; i < height && bitCount < messageLength; i++) {
    for (let j = skipCoeffs; j < width && bitCount < messageLength; j++) {
      if (bitCount < 32) {
        bitCount++;
        continue; // 跳過長度信息部分
      }
      
      const watermarked = watermarkedCoeffs[i][j];
      const original = originalCoeffs[i][j];
      const diff = watermarked - original;
      
      // 基於差異判斷位元
      const bit = diff > 0 ? 1 : 0;
      messageBits.push(bit);
      bitCount++;
    }
  }
  
  const message = binaryToString(messageBits);
  
  return {
    message,
    binary: messageBits,
    length: messageLength,
  };
}

/**
 * 計算提取置信度
 * @param binary 提取的二進位數據
 * @returns 置信度 (0-1)
 */
export function calculateConfidence(binary: number[]): number {
  if (!binary || binary.length === 0) return 0;
  
  let validChars = 0;
  let totalChars = 0;
  
  // 假設每個字符 8 位
  for (let i = 0; i < binary.length; i += 8) {
    if (i + 8 <= binary.length) {
      let val = 0;
      for (let j = 0; j < 8; j++) {
        val = (val << 1) | binary[i + j];
      }
      
      totalChars++;
      // 檢查是否為可打印字符或常見編碼範圍
      if ((val >= 32 && val <= 126) || val > 127) {
        validChars++;
      }
    }
  }
  
  return totalChars === 0 ? 0 : validChars / totalChars;
}
