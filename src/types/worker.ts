import { EmbedParams, ExtractParams, QualityMetrics } from '@/types';

export type WorkerTaskType = 'EMBED' | 'EXTRACT';

export interface EmbedTaskPayload {
  imageData: ImageData;
  watermarkText: string;
  params: EmbedParams;
  fileId: string;
}

export interface ExtractTaskPayload {
  imageData: ImageData;
  params: ExtractParams;
  fileId: string;
}

export type WorkerMessage = 
  | { type: 'EMBED'; payload: EmbedTaskPayload }
  | { type: 'EXTRACT'; payload: ExtractTaskPayload };

export type WorkerResponse =
  | { type: 'EMBED_SUCCESS'; payload: { imageData: ImageData; metrics: QualityMetrics; fileId: string } }
  | { type: 'EXTRACT_SUCCESS'; payload: { text: string; confidence: number; fileId: string } }
  | { type: 'ERROR'; payload: { error: string; fileId: string } };
