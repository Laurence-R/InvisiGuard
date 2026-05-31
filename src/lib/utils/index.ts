/**
 * 工具函數庫
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export * from './encoding';
export * from './metrics';

/**
 * 合併 Tailwind CSS 類名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 深拷貝二維數組
 */
export function deepCopy2DArray(arr: number[][]): number[][] {
  return arr.map(row => [...row]);
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
 * 產生浮水印參數記錄文字
 */
export function generateParamsText(params: {
  watermarkText: string;
  waveletType: string;
  subBand: string;
  decompositionLevel: number;
  quantizationStep: number;
  filenames?: string[];
}): string {
  const subBandLabels: Record<string, string> = {
    ll: 'LL（低頻）',
    lh: 'LH（水平高頻）',
    hl: 'HL（垂直高頻）',
    hh: 'HH（對角高頻）',
  };
  const waveletLabels: Record<string, string> = {
    haar: 'Haar（標準）',
    db4: 'Daubechies 4',
    db8: 'Daubechies 8',
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

  const lines = [
    'InvisiGuard 浮水印參數記錄',
    '===========================',
    `嵌入時間：${dateStr} ${timeStr}`,
    '',
    `嵌入訊息：${params.watermarkText}`,
    '',
    '演算法參數',
    '-----------',
    `小波類型：${waveletLabels[params.waveletType] ?? params.waveletType}`,
    `嵌入頻帶：${subBandLabels[params.subBand] ?? params.subBand}`,
    `分解層級：${params.decompositionLevel}`,
    `量化步長：${params.quantizationStep}`,
  ];

  if (params.filenames && params.filenames.length > 0) {
    lines.push('', '處理的圖片', '-----------');
    params.filenames.forEach((name, i) => lines.push(`${i + 1}. ${name}`));
  }

  lines.push('', '---', '請妥善保存此檔案，提取浮水印時需使用相同參數。');
  return lines.join('\n');
}


