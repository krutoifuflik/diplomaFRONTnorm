import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { videoService } from '../services/videoService';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

export const useWebSocket = (videoId: string, onComplete?: () => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const isProcessingComplete = useRef(false);
  const processedVideoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!videoId || isProcessingComplete.current || wsRef.current) {
      console.log('WebSocket initialization skipped:', {
        videoId,
        isComplete: isProcessingComplete.current,
        hasExistingConnection: !!wsRef.current
      });
      return;
    }

    console.log('Initializing WebSocket connection for video:', videoId);
    const ws = new WebSocket(`${WS_URL}?videoId=${videoId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = async (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        
        if ((data.status === 'completed' || data.message === 'complete.') && !isProcessingComplete.current) {
          console.log('Processing completed, fetching video...');
          isProcessingComplete.current = true;

          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const blob = await videoService.getProcessedVideo(videoId, 'video');
            processedVideoUrlRef.current = URL.createObjectURL(blob);
            console.log('Video blob URL created:', processedVideoUrlRef.current);
            toast.success('Video processing complete!');
            onComplete?.();
          } catch (error) {
            console.error('Failed to fetch processed video:', error);
            toast.error('Failed to load processed video');
          }

          ws.close();
          wsRef.current = null;
        }
      } catch (error) {
        console.error('Message parsing error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      wsRef.current = null;
    };

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (processedVideoUrlRef.current) {
        URL.revokeObjectURL(processedVideoUrlRef.current);
        processedVideoUrlRef.current = null;
      }
    };
  }, [videoId, onComplete]);

  return {
    isComplete: isProcessingComplete.current,
    processedVideoUrl: processedVideoUrlRef.current
  };
};
