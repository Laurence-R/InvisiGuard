'use client';

import { useState } from 'react';
import { TestTube, Loader2, Play, Zap, Activity } from 'lucide-react';
import { WaveletType, SubBand, ExtractParams } from '@/types';
import { loadImageFromFile, imageToImageData, imageDataToBlob } from '@/lib/image/loader';
import { jpegCompress, addGaussianNoise, resizeImage, rotateImage } from '@/lib/image/processor';
import { extractWatermark } from '@/lib/watermark';
import { stringToBinary, calculateBER } from '@/lib/utils';
import { ImageDropZone } from '@/components/watermark/ImageDropZone';
import { WatermarkParamsPanel } from '@/components/watermark/WatermarkParamsPanel';
import { PageHero } from '@/components/watermark/PageHero';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 測試設定的型別定義
interface TestResult {
  success: boolean;
  ber: number;
}

interface TestResults {
  jpegQ75?: TestResult;
  jpegQ50?: TestResult;
  gaussianNoise?: TestResult;
  scaling?: TestResult;
  rotation?: TestResult;
}

// TestResultRow 元件定義在主元件外部，避免每次 render 重建
function TestResultRow({ label, result }: { label: string; result: TestResult | undefined }) {
  if (!result) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-transparent">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">待測試</span>
      </div>
    );
  }
  const ber = result.ber * 100;
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">BER: {ber.toFixed(2)}%</span>
      </div>
      <Badge variant={result.success ? 'default' : 'destructive'} className={result.success ? 'bg-green-600 hover:bg-green-700' : ''}>
        {result.success ? '通過' : '失敗'}
      </Badge>
    </div>
  );
}

export default function TestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);

  const [originalMessage, setOriginalMessage] = useState('');
  const [waveletType, setWaveletType] = useState<WaveletType>(WaveletType.HAAR);
  const [decompositionLevel, setDecompositionLevel] = useState(2);
  const [embedBand, setEmbedBand] = useState<SubBand>(SubBand.HL);
  const [quantizationStep, setQuantizationStep] = useState(50);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
  };

  const handleTest = async () => {
    if (!selectedFile) return;
    setTesting(true);
    setResults(null);

    try {
      const img = await loadImageFromFile(selectedFile);
      const originalImageData = imageToImageData(img);
      const extractParams: ExtractParams = { waveletType, decompositionLevel, embedBand, quantizationStep };
      const originalBinary = stringToBinary(originalMessage);
      const testResults: TestResults = {};

      // 測試 1: JPEG 壓縮 Quality 75
      try {
        const compressed = await jpegCompress(originalImageData, 0.75);
        const blob = await imageDataToBlob(compressed);
        const file = new File([blob], 'c75.png', { type: 'image/png' });
        const r = await extractWatermark(file, extractParams);
        if (r.success && r.watermark) {
          testResults.jpegQ75 = { success: calculateBER(originalBinary, stringToBinary(r.watermark)) < 0.1, ber: calculateBER(originalBinary, stringToBinary(r.watermark)) };
        } else { testResults.jpegQ75 = { success: false, ber: 1.0 }; }
      } catch { testResults.jpegQ75 = { success: false, ber: 1.0 }; }

      // 測試 2: JPEG 壓縮 Quality 50
      try {
        const compressed = await jpegCompress(originalImageData, 0.5);
        const blob = await imageDataToBlob(compressed);
        const file = new File([blob], 'c50.png', { type: 'image/png' });
        const r = await extractWatermark(file, extractParams);
        if (r.success && r.watermark) {
          testResults.jpegQ50 = { success: calculateBER(originalBinary, stringToBinary(r.watermark)) < 0.2, ber: calculateBER(originalBinary, stringToBinary(r.watermark)) };
        } else { testResults.jpegQ50 = { success: false, ber: 1.0 }; }
      } catch { testResults.jpegQ50 = { success: false, ber: 1.0 }; }

      // 測試 3: 高斯噪聲
      try {
        const noisy = addGaussianNoise(originalImageData, 10);
        const blob = await imageDataToBlob(noisy);
        const file = new File([blob], 'noisy.png', { type: 'image/png' });
        const r = await extractWatermark(file, extractParams);
        if (r.success && r.watermark) {
          testResults.gaussianNoise = { success: calculateBER(originalBinary, stringToBinary(r.watermark)) < 0.15, ber: calculateBER(originalBinary, stringToBinary(r.watermark)) };
        } else { testResults.gaussianNoise = { success: false, ber: 1.0 }; }
      } catch { testResults.gaussianNoise = { success: false, ber: 1.0 }; }

      // 測試 4: 縮放攻擊
      try {
        const half = resizeImage(originalImageData, Math.floor(originalImageData.width / 2), Math.floor(originalImageData.height / 2));
        const back = resizeImage(half, originalImageData.width, originalImageData.height);
        const blob = await imageDataToBlob(back);
        const file = new File([blob], 'scaled.png', { type: 'image/png' });
        const r = await extractWatermark(file, extractParams);
        if (r.success && r.watermark) {
          testResults.scaling = { success: calculateBER(originalBinary, stringToBinary(r.watermark)) < 0.15, ber: calculateBER(originalBinary, stringToBinary(r.watermark)) };
        } else { testResults.scaling = { success: false, ber: 1.0 }; }
      } catch { testResults.scaling = { success: false, ber: 1.0 }; }

      // 測試 5: 旋轉攻擊
      try {
        const rotated = rotateImage(originalImageData, 5);
        const rotatedBack = rotateImage(rotated, -5);
        const resized = resizeImage(rotatedBack, originalImageData.width, originalImageData.height);
        const blob = await imageDataToBlob(resized);
        const file = new File([blob], 'rotated.png', { type: 'image/png' });
        const r = await extractWatermark(file, extractParams);
        if (r.success && r.watermark) {
          testResults.rotation = { success: calculateBER(originalBinary, stringToBinary(r.watermark)) < 0.3, ber: calculateBER(originalBinary, stringToBinary(r.watermark)) };
        } else { testResults.rotation = { success: false, ber: 1.0 }; }
      } catch { testResults.rotation = { success: false, ber: 1.0 }; }

      setResults(testResults);
    } catch (error) {
      console.error('測試錯誤:', error);
      alert('魯棒性測試失敗，請確認圖像包含浮水印且參數正確');
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="relative overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <PageHero badge="Robustness Lab" badgeClassName="border-amber-500/20 bg-amber-500/5 text-amber-600"
          title="強韌度測試實驗室" description="透過模擬常見攻擊場景，驗證浮水印在各種影像處理操作後的存活能力。" />

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <ImageDropZone selectedFile={selectedFile} onFileSelect={handleFileSelect}
              title="上傳測試圖像" description="選擇已嵌入浮水印的圖片"
              hint="支持 PNG, JPEG, WebP" id="test-file-upload"
              activeIcon={<TestTube className="h-8 w-8 text-primary" />} />

            <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">原始浮水印訊息</CardTitle>
                <CardDescription>輸入嵌入時使用的訊息，用於計算 BER</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>嵌入時的訊息</Label>
                  <Input value={originalMessage} onChange={(e) => setOriginalMessage(e.target.value)}
                    placeholder="輸入嵌入浮水印時的原始訊息" className="bg-background/50" />
                </div>
              </CardContent>
            </Card>

            <WatermarkParamsPanel waveletType={waveletType} subBand={embedBand}
              decompositionLevel={decompositionLevel} quantizationStep={quantizationStep}
              onWaveletTypeChange={setWaveletType} onSubBandChange={setEmbedBand}
              onDecompositionLevelChange={setDecompositionLevel} onQuantizationStepChange={setQuantizationStep}
              showLL={true} title="解碼參數" hint="需與嵌入時參數完全一致" />

            <Button onClick={handleTest} disabled={!selectedFile || testing}
              className="w-full h-12 text-base shadow-lg hover:shadow-primary/25 transition-all hover:scale-[1.02]" size="lg">
              {testing
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />測試中 (共 5 項)...</>
                : <><Play className="mr-2 h-5 w-5" />開始全部測試</>}
            </Button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {results ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <Card className="bg-background/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />測試結果
                    </CardTitle>
                    <CardDescription>
                      通過率：{Object.values(results).filter(r => r?.success).length} / {Object.values(results).length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <TestResultRow label="JPEG 壓縮 (Quality 75)" result={results.jpegQ75} />
                    <TestResultRow label="JPEG 壓縮 (Quality 50)" result={results.jpegQ50} />
                    <TestResultRow label="高斯噪聲干擾" result={results.gaussianNoise} />
                    <TestResultRow label="縮放攻擊 (50%)" result={results.scaling} />
                    <TestResultRow label="旋轉攻擊 (5°)" result={results.rotation} />
                  </CardContent>
                </Card>
              </div>
            ) : previewUrl ? (
              <Card className="overflow-hidden bg-background/40 border-muted backdrop-blur-sm">
                <div className="relative flex items-center justify-center p-8 min-h-[400px]">
                  <img src={previewUrl} alt="Test Target" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Badge variant="outline" className="bg-background/70 backdrop-blur-sm">確認參數後開始測試</Badge>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/5 backdrop-blur-sm">
                <TestTube className="h-16 w-16 mb-4 opacity-20" />
                <p>等待輸入...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
