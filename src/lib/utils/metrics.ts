/**
 * 影像品質評估指標
 */

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
  return 10 * Math.log10((255 * 255) / mse);
}

/**
 * 計算位元錯誤率 (BER)
 */
export function calculateBER(original: number[], extracted: number[]): number {
  let errors = 0;
  const length = Math.min(original.length, extracted.length);
  for (let i = 0; i < length; i++) {
    if (original[i] !== extracted[i]) errors++;
  }
  return errors / length;
}

/**
 * 計算結構相似性指數 (SSIM)
 */
export function calculateSSIM(original: number[][], modified: number[][]): number {
  const height = original.length;
  const width = original[0].length;

  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;

  let meanOriginal = 0;
  let meanModified = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      meanOriginal += original[i][j];
      meanModified += modified[i][j];
    }
  }
  meanOriginal /= height * width;
  meanModified /= height * width;

  let varianceOriginal = 0;
  let varianceModified = 0;
  let covariance = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const dO = original[i][j] - meanOriginal;
      const dM = modified[i][j] - meanModified;
      varianceOriginal += dO * dO;
      varianceModified += dM * dM;
      covariance += dO * dM;
    }
  }
  const n = height * width - 1;
  varianceOriginal /= n;
  varianceModified /= n;
  covariance /= n;

  const numerator = (2 * meanOriginal * meanModified + C1) * (2 * covariance + C2);
  const denominator =
    (meanOriginal ** 2 + meanModified ** 2 + C1) * (varianceOriginal + varianceModified + C2);
  return numerator / denominator;
}
