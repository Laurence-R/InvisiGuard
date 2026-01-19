/**
 * 小波濾波器係數
 */

import { WaveletType } from '@/types';

// 小波濾波器接口
export interface WaveletFilter {
  lowpass: number[];
  highpass: number[];
}

/**
 * Haar 小波濾波器
 * 最簡單的小波，適合快速處理
 */
const HAAR_FILTER: WaveletFilter = {
  lowpass: [0.7071067811865476, 0.7071067811865476],
  highpass: [-0.7071067811865476, 0.7071067811865476],
};

/**
 * Daubechies 4 小波濾波器
 * 提供更好的頻率分離
 */
const DB4_FILTER: WaveletFilter = {
  lowpass: [
    0.6830127018922193,
    1.1830127018922193,
    0.3169872981077807,
    -0.1830127018922193,
  ],
  highpass: [
    -0.1830127018922193,
    -0.3169872981077807,
    1.1830127018922193,
    -0.6830127018922193,
  ],
};

/**
 * Daubechies 8 小波濾波器
 * 提供最佳的平滑性和頻率定位
 */
const DB8_FILTER: WaveletFilter = {
  lowpass: [
    0.32580343,
    1.01094572,
    0.89220014,
    -0.03957503,
    -0.26450717,
    0.0436163,
    0.0465036,
    -0.01498699,
  ],
  highpass: [
    -0.01498699,
    -0.0465036,
    0.0436163,
    0.26450717,
    -0.03957503,
    -0.89220014,
    1.01094572,
    -0.32580343,
  ],
};

/**
 * 獲取指定類型的小波濾波器
 */
export function getWaveletFilter(type: WaveletType): WaveletFilter {
  switch (type) {
    case WaveletType.HAAR:
      return HAAR_FILTER;
    case WaveletType.DB4:
      return DB4_FILTER;
    case WaveletType.DB8:
      return DB8_FILTER;
    default:
      return HAAR_FILTER;
  }
}

/**
 * 獲取小波名稱
 */
export function getWaveletName(type: WaveletType): string {
  switch (type) {
    case WaveletType.HAAR:
      return 'Haar';
    case WaveletType.DB4:
      return 'Daubechies 4';
    case WaveletType.DB8:
      return 'Daubechies 8';
    default:
      return 'Unknown';
  }
}
