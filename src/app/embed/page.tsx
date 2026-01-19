'use client';

import { useState } from 'react';
import { Upload, Settings, Download, Loader2, AlertCircle, CheckCircle2, FileImage, Layers } from 'lucide-react';
import { WaveletType, SubBand } from '@/types';
import { embedWatermark } from '@/lib/watermark';
import { imageDataToBlob, downloadImage, loadImageFromFile, imageToImageData } from '@/lib/image/loader';
import { padToPowerOfTwo } from '@/lib/image/processor';
import { calculateCapacity } from '@/lib/algorithms/qim/embed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

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
  const [capacityWarning, setCapacityWarning] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setCapacity(null);
      setCapacityWarning('');
      
      // 計算嵌入容量
      try {
        const img = await loadImageFromFile(file);
        const imageData = imageToImageData(img);
        const { paddedImage } = padToPowerOfTwo(imageData);
        
        const cap = calculateCapacity(
          paddedImage.width,
          paddedImage.height,
          decompositionLevel
        );
        
        setCapacity(cap);
      } catch (error) {
        console.error('容量計算錯誤:', error);
      }
    }
  };

  const handleEmbed = async () => {
    if (!selectedFile || !watermarkText) {
      alert('請選擇圖像並輸入浮水印訊息');
      return;
    }
    
    // 檢查容量
    if (capacity !== null) {
      const messageBytes = watermarkText.length;
      const maxChars = Math.floor(capacity / 8);
      
      if (messageBytes > maxChars) {
        setCapacityWarning(`訊息過長！最多可嵌入 ${maxChars} 個字符，您輸入了 ${messageBytes} 個字符`);
        return;
      }
    }
    
    setCapacityWarning('');
    setProcessing(true);
    
    try {
      const embedResult = await embedWatermark(selectedFile, watermarkText, {
        waveletType,
        decompositionLevel,
        embedBand,
        quantizationStep,
        embedStrength: 0.5,
      });

      if (embedResult.success && embedResult.imageData) {
        const blob = await imageDataToBlob(embedResult.imageData, 'image/png');
        const url = URL.createObjectURL(blob);

        setResult({
          url,
          psnr: embedResult.metrics?.psnr || 0,
          ssim: embedResult.metrics?.ssim || 0,
          blob,
        });
      } else {
        alert('嵌入失敗: ' + (embedResult.error || '未知錯誤'));
      }
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

  const maxChars = capacity ? Math.floor(capacity / 8) : 0;
  const isOverCapacity = capacity ? watermarkText.length > maxChars : false;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      
      <main className="flex-1 relative overflow-hidden pt-8 pb-16">
         {/* Background Grid */}
         <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-10 space-y-4">
               <Badge variant="secondary" className="px-4 py-1.5 text-sm font-normal rounded-full border-primary/20 bg-primary/5 text-primary">
                 Secure Encryption
               </Badge>
               <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">浮水印嵌入</h1>
               <p className="text-muted-foreground text-lg max-w-2xl">
                 上傳您的圖像並嵌入隱形數位浮水印，保護您的智慧財產權而不影響視覺品質。
               </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
               {/* Left Column: Input */}
               <div className="lg:col-span-5 space-y-6">
                  {/* Image Upload */}
                  <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <Upload className="h-5 w-5 text-primary" />
                           上傳原圖
                        </CardTitle>
                        <CardDescription>選擇要保護的圖像檔案</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${selectedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
                           <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="file-upload"
                           />
                           <label htmlFor="file-upload" className="block w-full h-full cursor-pointer z-10">
                              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                 {selectedFile ? (
                                    <FileImage className="h-8 w-8 text-primary" />
                                 ) : (
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                 )}
                              </div>
                              <p className="text-foreground font-medium mb-1">
                                 {selectedFile ? selectedFile.name : "點擊或拖放圖像至此"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                 {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : "支持 PNG, JPEG, WebP (建議 512px+)"}
                              </p>
                           </label>
                        </div>
                        
                        {capacity !== null && (
                           <div className="mt-4 flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">最大容量</span>
                              <Badge variant="secondary">{maxChars} 字元</Badge>
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  {/* Watermark Message */}
                  <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <FileImage className="h-5 w-5 text-primary" />
                           浮水印訊息
                        </CardTitle>
                        <CardDescription>輸入隱藏的簽名或版權宣告</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <Textarea
                           value={watermarkText}
                           onChange={(e) => setWatermarkText(e.target.value)}
                           placeholder="例如：Copyright © 2024 MyCompany"
                           className="resize-none min-h-[100px] bg-background/50"
                        />
                        
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">使用量</span>
                              <span className={isOverCapacity ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                                 {watermarkText.length} / {maxChars || 0}
                              </span>
                           </div>
                           {capacity && (
                              <Progress 
                                 value={Math.min((watermarkText.length / maxChars) * 100, 100)} 
                                 className="h-2" 
                              />
                           )}
                        </div>

                        {capacityWarning && (
                           <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>容量警告</AlertTitle>
                              <AlertDescription>{capacityWarning}</AlertDescription>
                           </Alert>
                        )}
                     </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <Settings className="h-5 w-5 text-primary" />
                           進階參數
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label htmlFor="wavelet">小波類型</Label>
                              <Select value={waveletType} onValueChange={(value) => setWaveletType(value as WaveletType)}>
                                 <SelectTrigger className="bg-background/50">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value={WaveletType.HAAR}>Haar (標準)</SelectItem>
                                    <SelectItem value={WaveletType.DB4}>Daubechies 4</SelectItem>
                                    <SelectItem value={WaveletType.DB8}>Daubechies 8</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="band">嵌入頻帶</Label>
                              <Select value={embedBand} onValueChange={(value) => setEmbedBand(value as SubBand)}>
                                 <SelectTrigger className="bg-background/50">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value={SubBand.HL}>HL (垂直)</SelectItem>
                                    <SelectItem value={SubBand.LH}>LH (水平)</SelectItem>
                                    <SelectItem value={SubBand.HH}>HH (對角)</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-2">
                              <div className="flex justify-between">
                                 <Label>分解層級 (Level {decompositionLevel})</Label>
                              </div>
                              <Slider
                                 defaultValue={[decompositionLevel]}
                                 max={5}
                                 min={1}
                                 step={1}
                                 onValueChange={(val) => setDecompositionLevel(val[0])}
                              />
                           </div>
                           
                           <div className="space-y-2">
                              <div className="flex justify-between">
                                 <Label>量化步長 (Step: {quantizationStep})</Label>
                              </div>
                              <Slider
                                 defaultValue={[quantizationStep]}
                                 max={100}
                                 min={10}
                                 step={5}
                                 onValueChange={(val) => setQuantizationStep(val[0])}
                              />
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  <Button 
                     onClick={handleEmbed} 
                     disabled={!selectedFile || !watermarkText || processing || !!isOverCapacity}
                     className="w-full h-12 text-base shadow-lg hover:shadow-primary/25 transition-all hover:scale-[1.02]"
                     size="lg"
                  >
                     {processing ? (
                        <>
                           <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                           加密運算中...
                        </>
                     ) : (
                        <>
                           <Layers className="mr-2 h-5 w-5" />
                           開始嵌入浮水印
                        </>
                     )}
                  </Button>
               </div>

               {/* Right Column: Preview & Result */}
               <div className="lg:col-span-7 space-y-6">
                  {/* Results Display */}
                  {result ? (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="overflow-hidden border-green-500/20 shadow-lg shadow-green-500/5 bg-background/80 backdrop-blur-sm">
                           <div className="bg-green-500/10 border-b border-green-500/20 p-4 flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-semibold">嵌入成功</span>
                           </div>
                           <div className="p-0">
                              <div className="grid md:grid-cols-2">
                                 <div className="aspect-square relative bg-muted/30 flex items-center justify-center p-4 border-r border-muted/50">
                                    <img 
                                       src={result.url} 
                                       alt="Result" 
                                       className="max-w-full max-h-full object-contain rounded shadow-sm"
                                    />
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
                                             <Progress value={Math.min(result.psnr, 60) * (100/60)} className="h-2" />
                                             <p className="text-xs text-muted-foreground mt-1">越接近 60 dB 越好 (通常 {'>'} 35 dB 人眼難以察覺)</p>
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
                                       <Download className="mr-2 h-4 w-4" />
                                       下載加密圖片
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        </Card>
                     </div>
                  ) : previewUrl ? (
                     <Card className="overflow-hidden bg-background/40 border-muted backdrop-blur-sm">
                        <div className="aspect-video relative bg-[url(/grid.svg)] bg-center flex items-center justify-center p-8">
                           <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none h-20 top-auto bottom-0" />
                        </div>
                     </Card>
                  ) : (
                     <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/5 backdrop-blur-sm">
                        <FileImage className="h-16 w-16 mb-4 opacity-20" />
                        <p>請先上傳圖片以預覽</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
