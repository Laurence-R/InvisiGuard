# InvisiGuard - 影像浮水印系統

基於 **DWT (離散小波變換)** + **QIM (量化索引調變)** 算法的專業影像浮水印 Web 應用。

![InvisiGuard](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 功能特點

- **浮水印嵌入**：在圖像中嵌入不可見的浮水印訊息
- **浮水印提取**：從含浮水印的圖像中提取隱藏訊息
- **魯棒性測試**：測試浮水印對各種攻擊的抵抗能力
- **高品質保證**：PSNR > 35dB，SSIM > 0.95

## 📦 技術架構

### 前端框架
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**

### 核心算法
- **DWT (Discrete Wavelet Transform)**
  - 支持 Haar、Daubechies 4/8 等小波基
  - 多層級小波分解
  - 頻域處理提高隱蔽性

- **QIM (Quantization Index Modulation)**
  - 量化步長控制浮水印強度
  - 平衡抗攻擊性與隱蔽性

## 📁 專案結構

```
invisiguard-new/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 首頁
│   ├── embed/               # 浮水印嵌入頁面
│   ├── extract/             # 浮水印提取頁面
│   └── test/                # 魯棒性測試頁面
├── src/
│   ├── lib/                 # 核心功能庫
│   │   ├── algorithms/      # 算法實現
│   │   │   ├── dwt/        # DWT 算法
│   │   │   │   ├── wavelets.ts    # 小波濾波器
│   │   │   │   └── transform.ts   # DWT 變換
│   │   │   └── qim/        # QIM 算法
│   │   │       ├── embed.ts       # 浮水印嵌入
│   │   │       └── extract.ts     # 浮水印提取
│   │   ├── image/          # 圖像處理
│   │   │   ├── loader.ts          # 圖像載入與轉換
│   │   │   └── processor.ts       # 圖像處理工具
│   │   ├── utils/          # 工具函數
│   │   └── watermark.ts    # 浮水印主流程
│   ├── components/         # React 組件
│   ├── types/              # TypeScript 類型定義
│   └── workers/            # Web Workers
└── public/                 # 靜態資源
```

## 🛠️ 安裝與運行

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

應用將在 [http://localhost:3000](http://localhost:3000) 啟動。

### 生產構建
```bash
npm run build
npm start
```

## 📖 使用說明

### 1. 浮水印嵌入

1. 訪問「浮水印嵌入」頁面
2. 上傳原始圖像
3. 輸入要嵌入的浮水印訊息
4. 調整算法參數：
   - **小波類型**：Haar (快速) / DB4 (平衡) / DB8 (高品質)
   - **分解層數**：1-3 層
   - **嵌入頻帶**：HL (推薦) / LH / HH / LL
   - **量化步長**：10-100 (較大值提高魯棒性)
5. 點擊「開始嵌入」
6. 下載含浮水印的圖像

### 2. 浮水印提取

1. 訪問「浮水印提取」頁面
2. 上傳含浮水印的圖像
3. 設定與嵌入時相同的參數
4. 點擊「開始提取」
5. 查看提取的浮水印訊息和置信度

### 3. 魯棒性測試

1. 訪問「魯棒性測試」頁面
2. 上傳含浮水印的圖像
3. 點擊「開始測試」
4. 查看各項攻擊測試結果

## 🔬 算法原理

### DWT (離散小波變換)

```typescript
// 將圖像分解為不同頻率子帶
const dwtResult = dwt2D(image, WaveletType.HAAR);
// 結果包含：
// - LL: 低頻近似 (圖像主要內容)
// - LH: 水平高頻 (垂直邊緣)
// - HL: 垂直高頻 (水平邊緣) ← 通常用於嵌入
// - HH: 對角高頻 (紋理細節)
```

### QIM (量化索引調變)

```typescript
// 將浮水印位元嵌入到 DWT 係數中
function quantize(value: number, bit: number, step: number): number {
  if (bit === 0) {
    return Math.round(value / step) * step;  // 偶數倍
  } else {
    return Math.floor(value / step) * step + step / 2;  // 奇數倍
  }
}
```

## 📊 性能指標

| 指標 | 目標值 | 說明 |
|------|--------|------|
| PSNR | > 35 dB | 峰值信噪比，衡量視覺品質 |
| SSIM | > 0.95 | 結構相似性，衡量失真程度 |
| BER | < 5% | 位元錯誤率，衡量提取準確性 |
| 處理時間 | < 3s | 1MB 圖像的處理時間 |

## 🧪 魯棒性測試

支持的攻擊類型：
- ✅ JPEG 壓縮 (Q75, Q50)
- ✅ 高斯噪聲 (σ=10)
- ✅ 圖像縮放 (50% 縮小再放大)
- ✅ 旋轉攻擊 (小角度旋轉)
- ✅ 裁剪攻擊

## 🎯 接下來的工作

- [ ] 整合算法與前端（實現實際的嵌入/提取功能）
- [ ] 使用 Web Worker 優化性能
- [ ] 添加更多小波基支持
- [ ] 實現 SSIM 計算
- [ ] 添加批量處理功能
- [ ] 部署到 Vercel

## 📄 授權

MIT License

## 👥 貢獻

歡迎提交 Issue 和 Pull Request！

---

**專案狀態**: 🚧 開發中 | **版本**: 0.1.0 | **最後更新**: 2026-01-19
