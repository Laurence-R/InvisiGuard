'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, AlertCircle, CheckCircle2, FileImage, Layers } from 'lucide-react';
import { WaveletType, SubBand } from '@/types';
import { imageDataToBlob, downloadImage, loadImageFromFile, imageToImageData } from '@/lib/image/loader';
import { padToPowerOfTwo } from '@/lib/image/processor';
import { calculateCapacity } from '@/lib/algorithms/qim/embed';
import { useWatermarkWorker } from '@/hooks/useWatermarkWorker';
import { ImageDropZone } from '@/components/watermark/ImageDropZone';
import { WatermarkParamsPanel } from '@/components/watermark/WatermarkParamsPanel';
import { PageHero } from '@/components/watermark/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

export default function EmbedPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState('');
  const [waveletType, setWaveletType] = useState<WaveletType>(WaveletType.HAAR);
  const [decompositionLevel, setDecompositionLevel] = useState(2);
  const [embedBand, setEmbedBand] = useState<SubBand>(SubBand.HL);
  const [quantizationStep, setQuantizationStep] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; psnr: number; blob?: Blob; ssim?: number } | null>(null);
  const [capacity, setCapacity] = useState<number | null>(null);

  const { embedWatermarkWorker } = useWatermarkWorker();

  useEffect(() => {
    if (!selectedFile) { setCapacity(null); return; }
    loadImageFromFile(selectedFile)
      .then(img => {
        const imageData = imageToImageData(img);
        const { paddedImage } = padToPowerOfTwo(imageData);
        setCapacity(calculateCapacity(paddedImage.width, paddedImage.height, decompositionLevel));
      })
      .catch(console.error);
  }, [selectedFile, decompositionLevel]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const maxBytes = capacity !== null ? Math.floor(capacity / 8) : 0;
  const textByteLength = new TextEncoder().encode(watermarkText).length;
  const isOverCapacity = capacity !== null && textByteLength > maxBytes;

  const handleEmbed = async () => {
    if (!selectedFile || !watermarkText || isOverCapacity) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(selectedFile);
      const imageData = imageToImageData(img);
      const workerResult = await embedWatermarkWorker(imageData, watermarkText, {
        waveletType, decompositionLevel, embedBand, quantizationStep, embedStrength: 0.5,
      });
      const blob = await imageDataToBlob(workerResult.imageData, 'image/png');
      const url = URL.createObjectURL(blob);
      setResult({ url, psnr: workerResult.metrics.psnr, ssim: workerResult.metrics.ssim, blob });
    } catch (error) {
      alert('處理錯誤: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadImage(result.blob, `watermarked-${timestamp}.png`);
    }
  };

  return (
    <main className="relative overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size:[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <PageHero badge="Secure Encryption" title="浮水印嵌入" description="上傳您的圖像並嵌入隱形數位浮水印，保護您的智慧財產權而不影響視覺品質。" />

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <ImageDropZone selectedFile={selectedFile} onFileSelect={handleFileSelect}
              title="上傳原圖" description="選擇要保護的圖像檔案"
              hint="支持 PNG, JPEG, WebP (建議 512px+)" id="embed-file-upload" />

            <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileImage className="h-5 w-5 text-primary" />浮水印訊息
                </CardTitle>
                <CardDescription>輸入隱藏的簽名或版權宣告</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="例如：Copyright © 2024 MyCompany"
                  className="resize-none min-h-25 bg-background/50" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label className="text-muted-foreground">使用量 (bytes)</Label>
                    <span className={isOverCapacity ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {textByteLength} / {maxBytes || '—'}
                    </span>
                  </div>
                  {capacity !== null && (
                    <Progress value={Math.min((textByteLength / maxBytes) * 100, 100)} className="h-2" />
                  )}
                </div>
                {isOverCapacity && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>容量超出</AlertTitle>
                    <AlertDescription>訊息過長！最多 {maxBytes} bytes，目前 {textByteLength} bytes（中文每字約 3 bytes）</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <WatermarkParamsPanel waveletType={waveletType} subBand={embedBand}
              decompositionLevel={decompositionLevel} quantizationStep={quantizationStep}
              onWaveletTypeChange={setWaveletType} onSubBandChange={setEmbedBand}
              onDecompositionLevelChange={setDecompositionLevel} onQuantizationStepChange={setQuantizationStep}
              title="進階參數" />

            <Button onClick={handleEmbed}
              disabled={!selectedFile || !watermarkText || processing || isOverCapacity}
              className="w-full h-12 text-base shadow-lg hover:shadow-primary/25 transition-all hover:scale-[1.02]" size="lg">
              {processing
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />加密運算中...</>
                : <><Layers className="mr-2 h-5 w-5" />開始嵌入浮水印</>}
            </Button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="overflow-hidden border-green-500/20 shadow-lg shadow-green-500/5 bg-background/80 backdrop-blur-sm">
                  <div className="bg-green-500/10 border-b border-green-500/20 p-4 flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" /><span className="font-semibold">嵌入成功</span>
                  </div>
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-square relative bg-muted/30 flex items-center justify-center p-4 border-r border-muted/50">
                      <img src={result.url} alt="Result" className="max-w-full max-h-full object-contain rounded shadow-sm" />
                      <Badge className="absolute top-4 right-4 bg-green-600">已加密</Badge>
                    </div>
                    <div className="p-6 space-y-6 flex flex-col justify-center">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">品質指標 (Quality Metrics)</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>PSNR (峰值信噪比)</span>
                              <span className="font-mono">{result.psnr.toFixed(2)} dB</span>
                            </div>
                            <Progress value={Math.min(result.psnr, 60) * (100 / 60)} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">&gt; 35 dB 人眼難以察覺</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>SSIM (結構相似性)</span>
                              <span className="font-mono">{result.ssim?.toFixed(4)}</span>
                            </div>
                            <Progress value={(result.ssim || 0) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700 shadow-md">
                        <Download className="mr-2 h-4 w-4" />下載加密圖片
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : previewUrl ? (
              <Card className="overflow-hidden bg-background/40 border-muted backdrop-blur-sm">
                <div className="relative bg-muted/20 flex items-center justify-center p-8 min-h-100">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-125 object-contain rounded-lg shadow-xl" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Badge variant="outline" className="bg-background/70 backdrop-blur-sm">原圖預覽 — 尚未嵌入</Badge>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/5 backdrop-blur-sm">
                <FileImage className="h-16 w-16 mb-4 opacity-20" />
                <p>請先上傳圖片以預覽</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
