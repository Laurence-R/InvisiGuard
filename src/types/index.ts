/**
 * 核心類型定義
 */

// 小波基類型
export enum WaveletType {
  HAAR = 'haar',
  DB4 = 'db4',
  DB8 = 'db8',
}

// 頻帶類型
export enum SubBand {
  LL = 'll', // 低頻 (近似)
  LH = 'lh', // 水平高頻
  HL = 'hl', // 垂直高頻
  HH = 'hh', // 對角高頻
}

// 色彩空間
export enum ColorSpace {
  RGB = 'rgb',
  YUV = 'yuv',
  GRAY = 'gray',
}

// 圖像數據結構
export interface ImageData2D {
  data: number[][];
  width: number;
  height: number;
}

// DWT 變換結果
export interface DWTResult {
  ll: number[][]; // 低頻
  lh: number[][]; // 水平高頻
  hl: number[][]; // 垂直高頻
  hh: number[][]; // 對角高頻
  level: number;
}

// 浮水印嵌入參數
export interface EmbedParams {
  waveletType: WaveletType;
  decompositionLevel: number;
  embedBand: SubBand;
  quantizationStep: number;
  embedStrength: number;
}

// 浮水印提取參數
export interface ExtractParams {
  waveletType: WaveletType;
  decompositionLevel: number;
  embedBand: SubBand;
  quantizationStep: number;
}

// 浮水印數據
export interface WatermarkData {
  message: string;
  binary: number[];
  length: number;
}

// 處理結果
export interface ProcessResult {
  success: boolean;
  imageData?: ImageData;
  watermark?: string;
  metrics?: QualityMetrics;
  error?: string;
}

// 品質評估指標
export interface QualityMetrics {
  psnr: number; // 峰值信噪比
  ssim: number; // 結構相似性
  mse: number;  // 均方誤差
  ber?: number; // 位元錯誤率
}

// 魯棒性測試類型
export enum AttackType {
  JPEG_COMPRESSION = 'jpeg_compression',
  GAUSSIAN_NOISE = 'gaussian_noise',
  SCALING = 'scaling',
  ROTATION = 'rotation',
  CROPPING = 'cropping',
}

// 攻擊參數
export interface AttackParams {
  type: AttackType;
  intensity: number;
}
