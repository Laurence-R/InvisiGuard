'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, ShieldCheck, AlertTriangle, ScanEye } from 'lucide-react';
import { WaveletType, SubBand } from '@/types';
import { extractWatermark } from '@/lib/watermark';
import { ImageDropZone } from '@/components/watermark/ImageDropZone';
import { WatermarkParamsPanel } from '@/components/watermark/WatermarkParamsPanel';
import { PageHero } from '@/components/watermark/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExtractPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [waveletType, setWaveletType] = useState<WaveletType>(WaveletType.HAAR);
  const [decompositionLevel, setDecompositionLevel] = useState(2);
  const [embedBand, setEmbedBand] = useState<SubBand>(SubBand.HL);
  const [quantizationStep, setQuantizationStep] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ message: string; confidence: number } | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    try {
      const extractResult = await extractWatermark(selectedFile, {
        waveletType, decompositionLevel, embedBand, quantizationStep,
      });
      if (extractResult.success && extractResult.watermark) {
        setResult({ message: extractResult.watermark, confidence: extractResult.metrics?.ssim || 0.85 });
      } else {
        alert(extractResult.error || '浮水印提取失敗');
      }
    } catch (error) {
      console.error('提取錯誤:', error);
      alert('浮水印提取失敗，請確認參數設置是否與嵌入時一致');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="relative overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size:[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <PageHero badge="Extraction & Verification" title="浮水印提取驗證"
          description="透過盲檢測技術還原隱藏訊息，驗證圖片來源與版權歸屬。" />

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <ImageDropZone selectedFile={selectedFile} onFileSelect={handleFileSelect}
              title="上傳檢測圖像" description="選擇需驗證的圖片檔案"
              hint="支持 PNG, JPEG, WebP" id="extract-file-upload"
              activeIcon={<ScanEye className="h-8 w-8 text-primary" />} />

            <WatermarkParamsPanel waveletType={waveletType} subBand={embedBand}
              decompositionLevel={decompositionLevel} quantizationStep={quantizationStep}
              onWaveletTypeChange={setWaveletType} onSubBandChange={setEmbedBand}
              onDecompositionLevelChange={setDecompositionLevel} onQuantizationStepChange={setQuantizationStep}
              title="解碼參數"
              hint="參數需與嵌入時完全一致" />

            <Alert variant="default" className="bg-muted/30 border-muted">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-muted-foreground text-xs">
                若參數不匹配，提取結果將呈現亂碼。
              </AlertDescription>
            </Alert>

            <Button onClick={handleExtract} disabled={!selectedFile || processing}
              className="w-full h-12 text-base shadow-lg hover:shadow-primary/25 transition-all hover:scale-[1.02]" size="lg">
              {processing
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />分析中...</>
                : <><ScanEye className="mr-2 h-5 w-5" />開始提取</>}
            </Button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {result ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5 bg-background/80 backdrop-blur-sm">
                  <div className="bg-blue-500/10 border-b border-blue-500/20 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                      <ShieldCheck className="h-5 w-5" /><span className="font-semibold">提取完成</span>
                    </div>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <div className="space-y-2 mb-6">
                      <Label className="text-muted-foreground uppercase tracking-widest text-xs">Decoded Message</Label>
                      <div className="p-6 bg-muted/40 rounded-xl border border-muted/50 font-mono text-lg break-all">
                        {result.message}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">提取品質評估</span>
                        <span className={result.confidence > 0.9 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                          {result.confidence > 0.9 ? '優良' : result.confidence > 0.7 ? '良好' : '普通'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${result.confidence > 0.9 ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${result.confidence * 100}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {previewUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-muted bg-muted/20">
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Source Image</div>
                    <img src={previewUrl} className="w-full max-h-100 object-contain opacity-75 grayscale hover:grayscale-0 transition-all duration-500" alt="Source" />
                  </div>
                )}
              </div>
            ) : previewUrl ? (
              <Card className="overflow-hidden bg-background/40 border-muted backdrop-blur-sm">
                <div className="relative flex items-center justify-center p-8 min-h-100">
                  <img src={previewUrl} alt="Target" className="max-w-full max-h-123 object-contain rounded-lg shadow-xl" />
                </div>
              </Card>
            ) : (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/5 backdrop-blur-sm">
                <ScanEye className="h-16 w-16 mb-4 opacity-20" />
                <p>上傳圖片以開始分析</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
