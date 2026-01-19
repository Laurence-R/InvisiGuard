# InvisiGuard - 隱形數位浮水印系統

InvisiGuard 是一個基於瀏覽器的端對端加密浮水印解決方案。它結合 **DWT (離散小波變換)** 與 **QIM (量化索引調變)** 演算法，提供不可見、高魯棒性的版權保護機制。

本專案強調 **隱私優先 (Privacy First)** 與 **高效能 (Performance)**，所有的影像處理皆在用戶的瀏覽器端透過 Web Worker 完成，原始圖片與浮水印數據無需上傳至伺服器。

## 🌟 核心特點

*   **完全在地化處理 (Client-Side Processing)**：零伺服器上傳。利用瀏覽器算力，確保您的數據絕對私密與安全。
*   **Web Worker 架構**：將繁重的 DWT/QIM 運算移至背景執行緒，確保 UI 操作流暢不凍結。
*   **強大的演算法核心**：
    *   **DWT (Discrete Wavelet Transform)**：多層級頻域分解，將資訊隱藏於視覺不敏感區。
    *   **QIM (Quantization Index Modulation)**：抗干擾能力強，提供穩定的浮水印提取率。
*   **多模式支援**：
    *   **單張加密/提取**：針對個別圖片的精細操作。
    *   **批次處理 (Batch Processing)**：一鍵處理大量影像，自動化工作流。
*   **現代化 UI/UX**：基於 Shadcn/ui 與 Tailwind CSS 4 打造的響應式介面，支援淺色/深色模式。

## 🛠 技術堆疊

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **Language**: [TypeScript 5](https://www.typescriptlang.org/)
*   **UI Library**: [React 19](https://react.dev/), [Shadcn/ui](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Parallel Computing**: Native Web Workers

## 📂 專案結構

```
invisiguard-new/
├── public/                 # 靜態資源 (Logo, SVG)
├── src/
│   ├── app/                # Next.js App Router 頁面
│   │   ├── batch/          # 批次處理功能
│   │   ├── embed/          # 單張圖片嵌入
│   │   ├── extract/        # 浮水印提取
│   │   ├── test/           # 魯棒性測試
│   │   └── page.tsx        # 著陸頁 (Landing Page)
│   ├── components/
│   │   ├── layout/         # 全域佈局元件 (Header, Footer)
│   │   ├── ui/             # Shadcn 基礎 UI 元件
│   │   └── ...
│   ├── hooks/              # Custom React Hooks
│   │   └── useWatermarkWorker.ts # Worker 封裝 Hook
│   ├── lib/                # 核心演算法與工具
│   │   ├── algorithms/     # DWT & QIM 實作
│   │   └── image/          # 影像前處理 (Padding, RGB/YUV 轉換)
│   ├── types/              # TypeScript 型別定義
│   └── workers/            # Web Workers 入口
│       └── processor.worker.ts # 背景運算核心
└── ...
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器並訪問 [http://localhost:3000](http://localhost:3000) 即可看到應用程式。

### 3. 建置生產版本

```bash
npm run build
npm start
```

## 🧩 演算法簡介 (DWT + QIM)

InvisiGuard 使用 3 層 Haar 小波變換將圖像分解為 LL (低頻) 與 LH, HL, HH (高頻) 子帶。浮水印資訊通過 QIM 調變嵌入至中間頻帶 (LH/HL) 的係數中，這種方式在保持圖像視覺品質 (高 PSNR) 與抵抗壓縮/裁切攻擊 (高魯棒性) 之間取得了最佳平衡。

### 性能指標目標
*   **PSNR**: > 35 dB (視覺上無損)
*   **SSIM**: > 0.95
*   **處理速度**: < 1s (一般解析度，Client端)

## 📄 授權

此專案採用 MIT 授權條款。
