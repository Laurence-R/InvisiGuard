'use client';

import { useState } from 'react';
import { TestTube, Upload, Loader2, Play, Zap, FileJson, AlertCircle, Activity, Settings } from 'lucide-react';
import { WaveletType, SubBand, ExtractParams } from '@/types';
import { loadImageFromFile, imageToImageData } from '@/lib/image/loader';
import { jpegCompress, addGaussianNoise, resizeImage, rotateImage } from '@/lib/image/processor';
import { extractWatermark } from '@/lib/watermark';
import { stringToBinary, calculateBER } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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

export default function TestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  
  // 測試參數（使用者可自訂，需與嵌入時一致）
  const [originalMessage, setOriginalMessage] = useState("Copyright © 2024 MyCompany");
  const [waveletType, setWaveletType] = useState<WaveletType>(WaveletType.HAAR);
  const [decompositionLevel, setDecompositionLevel] = useState(2);
  const [embedBand, setEmbedBand] = useState<SubBand>(SubBand.HL);
  const [quantizationStep, setQuantizationStep] = useState(50);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const handleTest = async () => {
    if (!selectedFile) {
      alert('請選擇含浮水印的圖像');
      return;
    }

    setTesting(true);
    setResults(null);
    
    try {
      // 載入原始含浮水印的圖像
      const img = await loadImageFromFile(selectedFile);
      const originalImageData = imageToImageData(img);
      
      // 提取參數
      const extractParams: ExtractParams = {
        waveletType,
        decompositionLevel,
        embedBand,
        quantizationStep,
      };
      
      // 原始訊息的二進制形式
      const originalBinary = stringToBinary(originalMessage);
      
      const testResults: any = {};
      
      // 測試 1: JPEG 壓縮 Quality 75
      try {
        const compressed75 = await jpegCompress(originalImageData, 0.75);
        const compressed75Blob = await imageDataToBlob(compressed75);
        const compressed75File = new File([compressed75Blob], 'compressed75.jpg', { type: 'image/jpeg' });
        const extractResult75 = await extractWatermark(compressed75File, extractParams);
        
        if (extractResult75.success && extractResult75.watermark) {
          const extractedBinary = stringToBinary(extractResult75.watermark);
          const ber = calculateBER(originalBinary, extractedBinary);
          testResults.jpegQ75 = { success: ber < 0.1, ber };
        } else {
          testResults.jpegQ75 = { success: false, ber: 1.0 };
        }
      } catch (error) {
        testResults.jpegQ75 = { success: false, ber: 1.0 };
      }
      
      // 測試 2: JPEG 壓縮 Quality 50
      try {
        const compressed50 = await jpegCompress(originalImageData, 0.5);
        const compressed50Blob = await imageDataToBlob(compressed50);
        const compressed50File = new File([compressed50Blob], 'compressed50.jpg', { type: 'image/jpeg' });
        const extractResult50 = await extractWatermark(compressed50File, extractParams);
        
        if (extractResult50.success && extractResult50.watermark) {
          const extractedBinary = stringToBinary(extractResult50.watermark);
          const ber = calculateBER(originalBinary, extractedBinary);
          testResults.jpegQ50 = { success: ber < 0.2, ber };
        } else {
          testResults.jpegQ50 = { success: false, ber: 1.0 };
        }
      } catch (error) {
        testResults.jpegQ50 = { success: false, ber: 1.0 };
      }
      
      // 測試 3: 高斯噪聲
      try {
        const noisy = addGaussianNoise(originalImageData, 10);
        const noisyBlob = await imageDataToBlob(noisy);
        const noisyFile = new File([noisyBlob], 'noisy.png', { type: 'image/png' });
        const extractResultNoisy = await extractWatermark(noisyFile, extractParams);
        
        if (extractResultNoisy.success && extractResultNoisy.watermark) {
          const extractedBinary = stringToBinary(extractResultNoisy.watermark);
          const ber = calculateBER(originalBinary, extractedBinary);
          testResults.gaussianNoise = { success: ber < 0.15, ber };
        } else {
          testResults.gaussianNoise = { success: false, ber: 1.0 };
        }
      } catch (error) {
        testResults.gaussianNoise = { success: false, ber: 1.0 };
      }
      
      // 測試 4: 縮放攻擊（縮小到 50% 再放大回原尺寸）
      try {
        const halfWidth = Math.floor(originalImageData.width / 2);
        const halfHeight = Math.floor(originalImageData.height / 2);
        const scaled = resizeImage(originalImageData, halfWidth, halfHeight);
        const scaledBack = resizeImage(scaled, originalImageData.width, originalImageData.height);
        const scaledBlob = await imageDataToBlob(scaledBack);
        const scaledFile = new File([scaledBlob], 'scaled.png', { type: 'image/png' });
        const extractResultScaled = await extractWatermark(scaledFile, extractParams);
        
        if (extractResultScaled.success && extractResultScaled.watermark) {
          const extractedBinary = stringToBinary(extractResultScaled.watermark);
          const ber = calculateBER(originalBinary, extractedBinary);
          testResults.scaling = { success: ber < 0.15, ber };
        } else {
          testResults.scaling = { success: false, ber: 1.0 };
        }
      } catch (error) {
        testResults.scaling = { success: false, ber: 1.0 };
      }
      
      // 測試 5: 旋轉攻擊（旋轉 5 度再轉回）
      try {
        const rotated = rotateImage(originalImageData, 5);
        const rotatedBack = rotateImage(rotated, -5);
        // 裁剪回原始尺寸
        const resizedBack = resizeImage(rotatedBack, originalImageData.width, originalImageData.height);
        const rotatedBlob = await imageDataToBlob(resizedBack);
        const rotatedFile = new File([rotatedBlob], 'rotated.png', { type: 'image/png' });
        const extractResultRotated = await extractWatermark(rotatedFile, extractParams);
        
        if (extractResultRotated.success && extractResultRotated.watermark) {
          const extractedBinary = stringToBinary(extractResultRotated.watermark);
          const ber = calculateBER(originalBinary, extractedBinary);
          testResults.rotation = { success: ber < 0.3, ber };
        } else {
          testResults.rotation = { success: false, ber: 1.0 };
        }
      } catch (error) {
        testResults.rotation = { success: false, ber: 1.0 };
      }
      
      setResults(testResults);
    } catch (error) {
      console.error('測試錯誤:', error);
      alert('魯棒性測試失敗，請確認圖像包含浮水印且參數正確');
    } finally {
      setTesting(false);
    }
  };
  
  // 輔助函數：將 ImageData 轉換為 Blob
  async function imageDataToBlob(imageData: ImageData): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    ctx.putImageData(imageData, 0, 0);
    
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
        'image/png'
      );
    });
  }

  // Helper to render result row
  const TestResultRow = ({ label, result }: { label: string, result: TestResult | undefined }) => {
    if (!result) return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-transparent">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">待測試</span>
      </div>
    );

    const isSuccess = result.success;
    const ber = result.ber * 100;

    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${isSuccess ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
         <div className="flex flex-col">
            <span className="font-medium text-sm">{label}</span>
            <span className="text-xs text-muted-foreground">BER (Bit Error Rate): {ber.toFixed(2)}%</span>
         </div>
         <Badge variant={isSuccess ? "default" : "destructive"} className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}>
            {isSuccess ? "通過" : "失敗"}
         </Badge>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">

      <main className="flex-1 relative overflow-hidden pt-24 pb-16">
         <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-10 space-y-4">
               <Badge variant="secondary" className="px-4 py-1.5 text-sm font-normal rounded-full border-amber-500/20 bg-amber-500/5 text-amber-600">
                  Robustness Lab
               </Badge>
               <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">強韌度測試實驗室</h1>
               <p className="text-muted-foreground text-lg max-w-2xl">
                 透過模擬真實場景的攻擊測試（壓縮、噪聲、幾何變換），驗證演算法的強韌性。
               </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
               {/* Left Column: Configuration */}
               <div className="lg:col-span-5 space-y-6">
                  <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <Upload className="h-5 w-5 text-primary" />
                           測試素材與設定
                        </CardTitle>
                        <CardDescription>配置與嵌入時相同的參數以確保測試準確</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${selectedFile ? 'border-amber-500 bg-amber-500/5' : 'border-muted-foreground/25 hover:border-amber-500/50'}`}>
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
                                    <Activity className="h-8 w-8 text-amber-600" />
                                 ) : (
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                 )}
                              </div>
                              <p className="text-foreground font-medium mb-1">
                                {selectedFile ? selectedFile.name : "上傳測試圖片"}
                              </p>
                           </label>
                        </div>
                        
                        <div className="space-y-2">
                           <Label>原始嵌入訊息 (Ground Truth)</Label>
                           <Input 
                              value={originalMessage}
                              onChange={(e) => setOriginalMessage(e.target.value)}
                              placeholder="輸入嵌入時的原始訊息..."
                              className="font-mono bg-background/50"
                           />
                        </div>

                        {/* Advanced Parameters */}
                        <div className="space-y-4 pt-4 border-t border-muted/50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <Settings className="h-4 w-4" /> 演算法參數
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">小波類型</Label>
                                    <Select value={waveletType} onValueChange={(v) => setWaveletType(v as WaveletType)}>
                                        <SelectTrigger className="h-8 text-xs bg-background/50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={WaveletType.HAAR}>Haar</SelectItem>
                                            <SelectItem value={WaveletType.DB4}>DB4</SelectItem>
                                            <SelectItem value={WaveletType.DB8}>DB8</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">嵌入頻帶</Label>
                                    <Select value={embedBand} onValueChange={(v) => setEmbedBand(v as SubBand)}>
                                        <SelectTrigger className="h-8 text-xs bg-background/50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={SubBand.HL}>HL</SelectItem>
                                            <SelectItem value={SubBand.LH}>LH</SelectItem>
                                            <SelectItem value={SubBand.HH}>HH</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                           <div className="space-y-3">
                               <div className="space-y-1">
                                   <div className="flex justify-between text-xs">
                                       <Label className="text-xs">分解層級 Level {decompositionLevel}</Label>
                                   </div>
                                   <Slider
                                       value={[decompositionLevel]}
                                       max={5}
                                       min={1}
                                       step={1}
                                       onValueChange={(val) => setDecompositionLevel(val[0])}
                                   />
                               </div>
                               <div className="space-y-1">
                                   <div className="flex justify-between text-xs">
                                       <Label className="text-xs">量化步長 Step {quantizationStep}</Label>
                                   </div>
                                   <Slider
                                       value={[quantizationStep]}
                                       max={100}
                                       min={10}
                                       step={5}
                                       onValueChange={(val) => setQuantizationStep(val[0])}
                                   />
                               </div>
                           </div>
                        </div>

                     </CardContent>
                  </Card>

                  <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <Zap className="h-5 w-5 text-primary" />
                           開始驗證
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Button
                           onClick={handleTest}
                           disabled={!selectedFile || testing}
                           className="w-full h-12 text-base shadow-lg hover:shadow-amber-500/25 bg-amber-600 hover:bg-amber-700 text-white transition-all hover:scale-[1.02]"
                           size="lg"
                        >
                           {testing ? (
                              <>
                                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                 執行中的破壞性測試...
                              </>
                           ) : (
                              <>
                                 <Play className="mr-2 h-5 w-5" />
                                 執行自動化測試 (5項)
                              </>
                           )}
                        </Button>
                     </CardContent>
                  </Card>
               </div>

               {/* Right Column: Console Output */}
               <div className="lg:col-span-7 space-y-6">
                  {results ? (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-amber-500/20 shadow-lg shadow-amber-500/5 overflow-hidden bg-background/80 backdrop-blur-sm">
                           <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-amber-700">
                                 <FileJson className="h-5 w-5" />
                                 <span className="font-semibold">測試報告</span>
                              </div>
                              <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                                 {Object.values(results).filter((r:any) => r.success).length} / {Object.keys(results).length} 通過
                              </Badge>
                           </div>
                           <CardContent className="p-6 space-y-4">
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
                        <div className="aspect-video relative flex items-center justify-center p-8 bg-[url(/grid.svg)]">
                           <img 
                              src={previewUrl} 
                              alt="Test Target" 
                              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none flex items-end justify-center pb-8">
                               <p className="text-muted-foreground text-sm font-medium">參數確認無誤後請按下開始測試</p>
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
    </div>
  );
}
