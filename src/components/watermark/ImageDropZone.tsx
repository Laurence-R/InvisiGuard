'use client';

import { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageDropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  title?: string;
  description?: string;
  hint?: string;
  activeIcon?: React.ReactNode;
  id?: string;
}

export function ImageDropZone({
  onFileSelect,
  selectedFile,
  title = '上傳圖像',
  description = '選擇圖像檔案',
  hint = '支持 PNG, JPEG, WebP',
  activeIcon,
  id = 'file-upload',
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // 清空 input 值，確保選同一檔案時仍觸發 onChange
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <Card className="bg-background/60 backdrop-blur-sm border-muted/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : selectedFile
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id={id}
          />
          <label htmlFor={id} className="block w-full h-full cursor-pointer">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              {selectedFile
                ? (activeIcon ?? <FileImage className="h-8 w-8 text-primary" />)
                : <Upload className="h-8 w-8 text-muted-foreground" />
              }
            </div>
            <p className="text-foreground font-medium mb-1">
              {selectedFile ? selectedFile.name : '點擊或拖放圖像至此'}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : hint}
            </p>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
