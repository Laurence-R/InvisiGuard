'use client';

import { SubBand, WaveletType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

interface WatermarkParamsPanelProps {
  waveletType: WaveletType;
  subBand: SubBand;
  decompositionLevel: number;
  quantizationStep: number;
  onWaveletTypeChange: (value: WaveletType) => void;
  onSubBandChange: (value: SubBand) => void;
  onDecompositionLevelChange: (value: number) => void;
  onQuantizationStepChange: (value: number) => void;
  title?: string;
  hint?: string;
}

export function WatermarkParamsPanel({
  waveletType,
  subBand,
  decompositionLevel,
  quantizationStep,
  onWaveletTypeChange,
  onSubBandChange,
  onDecompositionLevelChange,
  onQuantizationStepChange,
  title = '演算法參數',
  hint,
}: WatermarkParamsPanelProps) {
  return (
    <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>小波類型</Label>
            <Select value={waveletType} onValueChange={(v) => onWaveletTypeChange(v as WaveletType)}>
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
            <Label>嵌入頻帶</Label>
            <Select value={subBand} onValueChange={(v) => onSubBandChange(v as SubBand)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SubBand.LL}>LL (低頻)</SelectItem>
                <SelectItem value={SubBand.LH}>LH (水平)</SelectItem>
                <SelectItem value={SubBand.HL}>HL (垂直)</SelectItem>
                <SelectItem value={SubBand.HH}>HH (對角)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>分解層級 (Level {decompositionLevel})</Label>
            <Slider
              value={[decompositionLevel]}
              max={5}
              min={1}
              step={1}
              onValueChange={(val) => onDecompositionLevelChange(val[0])}
            />
          </div>
          <div className="space-y-2">
            <Label>量化步長 (Step: {quantizationStep})</Label>
            <Slider
              value={[quantizationStep]}
              max={100}
              min={10}
              step={5}
              onValueChange={(val) => onQuantizationStepChange(val[0])}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
