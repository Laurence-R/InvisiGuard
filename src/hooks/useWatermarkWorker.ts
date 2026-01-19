'use client';

import { useEffect, useRef, useState } from 'react';
import { WorkerMessage, WorkerResponse } from '@/types/worker';
import { EmbedParams, ExtractParams, QualityMetrics } from '@/types';

type PendingTask = {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
};

export function useWatermarkWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingTasks = useRef<Map<string, PendingTask>>(new Map());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // We use relative path for webpack to bundle it correctly
    const worker = new Worker(new URL('../workers/processor.worker.ts', import.meta.url));
    workerRef.current = worker;
    setIsReady(true);

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload } = event.data;
      
      let fileId = '';
      // We know all payloads have fileId based on our type definition
      if ('fileId' in payload) {
        fileId = payload.fileId;
      }

      const task = pendingTasks.current.get(fileId);
      if (task) {
        if (type === 'ERROR') {
          task.reject(new Error((payload as any).error));
        } else {
          task.resolve(payload);
        }
        pendingTasks.current.delete(fileId);
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
    };

    return () => {
      worker.terminate();
    };
  }, []);

  const embedWatermarkWorker = async (
    imageData: ImageData,
    watermarkText: string,
    params: EmbedParams,
    id: string = Math.random().toString(36)
  ): Promise<{ imageData: ImageData; metrics: QualityMetrics; fileId: string }> => {
    if (!workerRef.current) throw new Error('Worker not ready');
    
    return new Promise((resolve, reject) => {
      pendingTasks.current.set(id, { resolve, reject });
      
      const message: WorkerMessage = {
        type: 'EMBED',
        payload: {
          imageData,
          watermarkText,
          params,
          fileId: id
        }
      };
      
      workerRef.current?.postMessage(message);
    });
  };

  const extractWatermarkWorker = async (
    imageData: ImageData,
    params: ExtractParams,
    id: string = Math.random().toString(36)
  ): Promise<{ text: string; confidence: number; fileId: string }> => {
     if (!workerRef.current) throw new Error('Worker not ready');
    
    return new Promise((resolve, reject) => {
      pendingTasks.current.set(id, { resolve, reject });
      
      const message: WorkerMessage = {
        type: 'EXTRACT',
        payload: {
          imageData,
          params,
          fileId: id
        }
      };
      
      workerRef.current?.postMessage(message);
    });
  };

  return { embedWatermarkWorker, extractWatermarkWorker, isReady };
}
