'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
    Upload,
    Download,
    Loader2,
    Layers,
    X,
    Play,
    Trash2,
    Package
} from 'lucide-react';
import JSZip from 'jszip';
import { WaveletType, SubBand, EmbedParams } from '@/types';
// import { embedWatermark } from '@/lib/watermark'; // Removed direct usage
import { loadImageFromFile, imageToImageData, imageDataToBlob } from '@/lib/image/loader';
import { useWatermarkWorker } from '@/hooks/useWatermarkWorker';
import { WatermarkParamsPanel } from '@/components/watermark/WatermarkParamsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { generateParamsText } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

type BatchItem = {
    id: string;
    file: File;
    previewUrl: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    resultBlob?: Blob;
    error?: string;
};

export default function BatchEmbedPage() {
    const [items, setItems] = useState<BatchItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);
    const { embedWatermarkWorker, isReady } = useWatermarkWorker();

    // Embed Params
    const [watermarkText, setWatermarkText] = useState('');
    const [quantizationStep, setQuantizationStep] = useState(50);
    const [decompositionLevel, setDecompositionLevel] = useState(2);
    const [embedBand, setEmbedBand] = useState<SubBand>(SubBand.HH);
    const [waveletType, setWaveletType] = useState<WaveletType>(WaveletType.HAAR);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle File Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            const newItems: BatchItem[] = newFiles.map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                previewUrl: URL.createObjectURL(file),
                status: 'pending'
            }));

            setItems(prev => [...prev, ...newItems]);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Cleanup preview URLs on unmount or remove
    useEffect(() => {
        return () => {
            items.forEach(item => URL.revokeObjectURL(item.previewUrl));
        };
    }, []);

    const removeItem = (id: string) => {
        setItems(prev => {
            const itemToRemove = prev.find(item => item.id === id);
            if (itemToRemove) {
                URL.revokeObjectURL(itemToRemove.previewUrl);
            }
            return prev.filter(item => item.id !== id);
        });
    };

    const clearAll = () => {
        items.forEach(item => URL.revokeObjectURL(item.previewUrl));
        setItems([]);
        setOverallProgress(0);
    };

    const processBatch = async () => {
        if (!isReady) {
            alert("系統正在初始化處理核心，請稍候...");
            return;
        }

        setIsProcessing(true);
        setOverallProgress(0);

        // Process strictly sequentially to avoid UI freeze
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.status === 'completed') continue; // Skip already done

            // Update status to processing
            setItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'processing' } : it));

            // Small yielding
            await new Promise(resolve => setTimeout(resolve, 10));

            const params: EmbedParams = {
                quantizationStep,
                decompositionLevel,
                embedBand,
                waveletType,
                embedStrength: 0.5 // Default strength since we use Step primarily
            };

            try {
                // 1. Load Image (Main Thread)
                const img = await loadImageFromFile(item.file);
                const imageData = imageToImageData(img);

                // 2. Process in Worker (Offloaded)
                const result = await embedWatermarkWorker(
                    imageData,
                    watermarkText,
                    params,
                    item.id
                );

                // 3. Convert to Blob (Main Thread)
                const blob = await imageDataToBlob(result.imageData);

                setItems(prev => prev.map(it => it.id === item.id ? {
                    ...it,
                    status: 'completed',
                    resultBlob: blob
                } : it));

            } catch (err) {
                console.error(err);
                setItems(prev => prev.map(it => it.id === item.id ? {
                    ...it,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Processing failed'
                } : it));
            }

            setOverallProgress(((i + 1) / items.length) * 100);
        }

        setIsProcessing(false);
    };

    const downloadAll = async () => {
        const zip = new JSZip();
        const completedItems = items.filter(item => item.status === 'completed' && item.resultBlob);

        if (completedItems.length === 0) return;

        const protectedFilenames: string[] = [];
        completedItems.forEach(item => {
            const nameParts = item.file.name.split('.');
            const ext = nameParts.pop();
            const name = nameParts.join('.');
            const newFilename = `${name}_protected.${ext || 'png'}`;
            protectedFilenames.push(newFilename);
            zip.file(newFilename, item.resultBlob!);
        });

        zip.file('watermark-params.txt', generateParamsText({
            watermarkText,
            waveletType,
            subBand: embedBand,
            decompositionLevel,
            quantizationStep,
            filenames: protectedFilenames,
        }));

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);

        const a = document.createElement('a');
        a.href = url;
        a.download = `InvisiGuard_Batch_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <main className="relative overflow-hidden pt-24 pb-16">
                {/* Background Grid */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size:[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">批次浮水印處理</h1>
                            <p className="text-muted-foreground">一次處理多張圖片，自動化您的工作流程。</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={clearAll} disabled={isProcessing || items.length === 0}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                清空列表
                            </Button>
                            <Button
                                onClick={processBatch}
                                disabled={isProcessing || items.length === 0 || items.every(i => i.status === 'completed')}
                                className="min-w-35"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        處理中...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        開始處理
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Settings & Upload */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Upload Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        新增圖片
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileUpload}
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                                                <Layers className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-medium">點擊或拖放圖片至此</p>
                                            <p className="text-xs text-muted-foreground">支援 PNG, JPG (多選)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 浮水印訊息 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">隱藏訊息內容</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <Label>套用於所有圖片</Label>
                                        <Textarea
                                            placeholder="例如：Copyright © 2024 MyCompany"
                                            value={watermarkText}
                                            onChange={(e) => setWatermarkText(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <WatermarkParamsPanel
                                waveletType={waveletType}
                                subBand={embedBand}
                                decompositionLevel={decompositionLevel}
                                quantizationStep={quantizationStep}
                                onWaveletTypeChange={setWaveletType}
                                onSubBandChange={setEmbedBand}
                                onDecompositionLevelChange={setDecompositionLevel}
                                onQuantizationStepChange={setQuantizationStep}
                                onReset={() => { setWaveletType(WaveletType.HAAR); setEmbedBand(SubBand.HH); setDecompositionLevel(2); setQuantizationStep(50); }}
                                title="全域參數設定"
                                hint="這些設定將應用於所有圖片"
                            />
                        </div>

                        {/* Right Column: Queue List */}
                        <div className="lg:col-span-8">
                            <div className="space-y-4">
                                {/* Progress Bar */}
                                {items.length > 0 && (
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                        <span>處理進度 ({items.filter(i => i.status === 'completed').length}/{items.length})</span>
                                        <span>{Math.round(overallProgress)}%</span>
                                    </div>
                                )}
                                {isProcessing && <Progress value={overallProgress} className="h-2 mb-6" />}

                                {/* Empty State */}
                                {items.length === 0 && (
                                    <div className="h-100 flex flex-col items-center justify-center border rounded-xl bg-muted/20 text-muted-foreground">
                                        <Package className="h-12 w-12 mb-4 opacity-20" />
                                        <p>尚未加入任何圖片</p>
                                    </div>
                                )}

                                {/* List */}
                                <div className="grid gap-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="group relative flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                                            {/* Preview Thumbnail */}
                                            <div className="relative h-16 w-24 rounded-md overflow-hidden bg-muted shrink-0">
                                                <Image
                                                    src={item.previewUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized // For blob urls
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{item.file.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {(item.file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center gap-3">
                                                {item.status === 'pending' && <Badge variant="outline" className="text-muted-foreground">等待中</Badge>}
                                                {item.status === 'processing' && <Badge variant="secondary" className="animate-pulse">處理中</Badge>}
                                                {item.status === 'completed' && <Badge className="bg-green-600 hover:bg-green-600">完成</Badge>}
                                                {item.status === 'error' && <Badge variant="destructive">失敗</Badge>}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={isProcessing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Download Action */}
                                {items.some(i => i.status === 'completed') && (
                                    <div className="mt-8 flex justify-end">
                                        <Button size="lg" onClick={downloadAll}>
                                            <Download className="mr-2 h-4 w-4" />
                                            下載已處理檔案 (ZIP)
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
    );
}
