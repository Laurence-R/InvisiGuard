'use client';

import { SubBand, WaveletType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, RotateCcw, HelpCircle } from 'lucide-react';

interface WatermarkParamsPanelProps {
  waveletType: WaveletType;
  subBand: SubBand;
  decompositionLevel: number;
  quantizationStep: number;
  onWaveletTypeChange: (value: WaveletType) => void;
  onSubBandChange: (value: SubBand) => void;
  onDecompositionLevelChange: (value: number) => void;
  onQuantizationStepChange: (value: number) => void;
  onReset?: () => void;
  title?: string;
  hint?: string;
}

function ParamLabel({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <div className="flex items-center gap-1">
      <Label>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-56 text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
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
  onReset,
  title = '演算法參數',
  hint,
}: WatermarkParamsPanelProps) {
  return (
    <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {onReset && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  推薦值
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                重置為推薦參數：Haar / HH / Level 2 / Step 50
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {hint && <CardDescription>{hint}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <ParamLabel tooltip="Haar 適合一般用途，運算快速；DB4/DB8 對複雜影像有更好的抗攻擊性，但較耗時。">
              小波類型
            </ParamLabel>
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
            <ParamLabel tooltip="HH 對角高頻：視覺干擾最小（推薦）；HL/LH：中等強健；LL 低頻：最強健但對畫質影響最大。">
              嵌入頻帶
            </ParamLabel>
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
            <ParamLabel tooltip="DWT 分解的層數。層級越高嵌入越深、抗攻擊越強，但處理時間增加。建議值：2–3。">
              分解層級 (Level {decompositionLevel})
            </ParamLabel>
            <Slider
              value={[decompositionLevel]}
              max={5}
              min={1}
              step={1}
              onValueChange={(val) => onDecompositionLevelChange(val[0])}
            />
          </div>
          <div className="space-y-2">
            <ParamLabel tooltip="QIM 量化間隔大小。數值越大浮水印越強健、越難被破壞，但圖片品質（PSNR）下降越多。建議值：40–60。">
              量化步長 (Step: {quantizationStep})
            </ParamLabel>
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
