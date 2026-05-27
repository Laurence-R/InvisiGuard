/**
 * 字符串 ↔ 二進制陣列 編解碼工具（UTF-8 完整支援）
 */

/**
 * 將字串轉換為二進制數組（UTF-8 編碼，支援中文 / Emoji）
 */
export function stringToBinary(str: string): number[] {
  const bytes = new TextEncoder().encode(str);
  const binary: number[] = [];
  for (const byte of bytes) {
    for (let j = 7; j >= 0; j--) {
      binary.push((byte >> j) & 1);
    }
  }
  return binary;
}

/**
 * 將二進制數組還原為字串（UTF-8 解碼，支援中文 / Emoji）
 */
export function binaryToString(binary: number[]): string {
  const bytes: number[] = [];
  for (let i = 0; i + 7 < binary.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (binary[i + j] ?? 0);
    }
    bytes.push(byte);
  }
  // 移除結尾的零字節（結束符）
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) end--;
  return new TextDecoder().decode(new Uint8Array(bytes.slice(0, end)));
}
