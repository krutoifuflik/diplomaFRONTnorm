import { api } from '../config/axios';
import { Video, Detection } from '../types';

export const videoService = {
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<Video> {
    console.log('[API] Starting video upload', {
      method: 'POST',
      endpoint: '/videos/upload',
      file: {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      }
    });

    if (!file) {
      console.error('[Validation Error] No file provided for upload');
      throw new Error('No file provided for upload');
    }
    console.log('[Base URL Check]', { baseURL: api.defaults.baseURL });
    if (!api.defaults.baseURL) {
      console.error('[Config Error] baseURL is not configured in axios instance');
      throw new Error('baseURL is not configured in axios instance');
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },  
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && progressEvent.total > 0) {
            const progress = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
            console.log(`[Upload Progress] ${progress}%`, {
              loaded: progressEvent.loaded,
              total: progressEvent.total
            });
            onProgress?.(progress);
          } else {
            console.warn('[Upload Progress] Unable to calculate progress', progressEvent);
          }
        },
        timeout: 600000
      });

      console.log('[API] Upload completed', {
        status: response.status,
        data: {
          videoId: response.data?.video?.id,
          filename: response.data?.video?.original_filename
        }
      });

      if (!response.data?.video?.id) {
        console.error('[Response Error] Invalid server response: missing video ID', response.data);
        throw new Error('Invalid server response: missing video ID');
      }

      const videoInfo = response.data.video;
      onProgress?.(100);

      const videoData = {
        id: videoInfo.id,
        title: videoInfo.original_filename || file.name,
        url: `${api.defaults.baseURL}/videos/${videoInfo.id}/processed`,
        thumbnail: '',
        uploadDate: new Date(),
        duration: 0,
        resolution: '',
        fps: 0,
        fileSize: file.size,
        status: 'processing',
        tags: [],
        userId: videoInfo.user_id || ''
      };

      console.log('[API] Video metadata prepared', videoData);
      return videoData;
    } catch (error) {
      console.error('[API] Upload failed', {
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      });
      throw error;
    }
  },

  async getProcessedVideo(id: string, title: string): Promise<Blob> {
    const endpoint = `/videos/${id}/processed`;
    const fullUrl = `${api.defaults.baseURL}${endpoint}`;
    console.log('[API] Sending GET request', {
      method: 'GET',
      endpoint,
      fullUrl,
      params: { id, title }
    });

    if (!id) {
      console.error('[Validation Error] No video ID provided');
      throw new Error('No video ID provided');
    }

    

    console.log('[Base URL Check]', { baseURL: api.defaults.baseURL });
    if (!api.defaults.baseURL) {
      console.error('[Config Error] baseURL is not configured in axios instance');
      throw new Error('baseURL is not configured in axios instance');
    }

    try {
      console.log('[API] Sending GET request to', { fullUrl });
      const response = await api.get(endpoint, {
        responseType: 'blob',
        
        timeout: 300000
      });

      console.log("RESPONMSESESESE: " , response)

      if (!(response.data instanceof Blob)) {
        console.error('[Response Error] Expected Blob, but received:', response.data);
        throw new Error('Invalid response type: expected Blob');
      }

      console.log('[API] Video fetched successfully', {
        status: response.status,
        size: `${(response.data.size / 1024 / 1024).toFixed(2)} MB`,
        type: response.data.type
      });

      return response.data;
    } catch (error) {
      console.error('[API] GET request failed', {
        endpoint,
        fullUrl,
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      });
      throw error;
    }
  },

  async forceDownload(id: string, title: string, blob: Blob): Promise<void> {
    console.log('[Download] Starting force download', { id, title });

    if (!id || !title || !blob) {
      console.error('[Validation Error] Missing id, title, or blob', { id, title, blob });
      throw new Error('Missing id, title, or blob');
    }

    const url = URL.createObjectURL(blob);
    const filename = `${title.replace(/\s+/g, '_')}_backup.mp4`;

    console.log('[Download] Creating download link', {
      blobSize: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
      filename
    });

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('[Download] Cleanup completed');
    }, 100);

    console.log('[Download] File download initiated', { filename });
  },

  async getVideoReport(id: string): Promise<Detection[]> {
    console.log('[API] Fetching video report', {
      method: 'GET',
      endpoint: `/videos/${id}/report`
    });

    if (!id) {
      console.error('[Validation Error] No video ID provided');
      throw new Error('No video ID provided');
    }

    try {
      const response = await api.get<Detection[]>(`/videos/${id}/report`, {
       
      });

      console.log('[API] Report received', {
        itemCount: response.data.length,
        sample: response.data.length > 0 ? response.data[0] : null
      });

      return response.data;
    } catch (error) {
      console.error('[API] Report fetch failed', {
        endpoint: `/videos/${id}/report`,
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      });
      throw error;
    }
  },

  async waitForProcessedVideo(id: string, title: string, intervalMs: number = 5000, maxAttempts: number = 60): Promise<void> {
    console.log('[Polling] Starting to wait for processed video', { id, title, intervalMs, maxAttempts });

    let attempts = 0;

    const poll = async (resolve: () => void, reject: (reason?: any) => void) => {
      attempts++;
      console.log(`[Polling] Attempt ${attempts}/${maxAttempts} to fetch processed video`, { id });

      try {
        const blob = await this.getProcessedVideo(id, title);
        console.log('[Polling] Video is ready', { id, size: `${(blob.size / 1024 / 1024).toFixed(2)} MB` });
        await this.forceDownload(id, title, blob);
        resolve();
      } catch (error: any) {
        if (error.response?.status === 404 || error.response?.status === 202) {
          console.log(`[Polling] Video not ready yet (status: ${error.response?.status}), retrying in ${intervalMs}ms`, { attempt: attempts });
        } else {
          console.error(`[Polling] Unexpected error (status: ${error.response?.status})`, { error: error.message });
        }

        if (attempts >= maxAttempts) {
          console.error('[Polling] Max attempts reached, giving up', { id, attempts });
          reject(new Error(`Failed to fetch processed video after ${maxAttempts} attempts: ${error.message}`));
          return;
        }

        setTimeout(() => poll(resolve, reject), intervalMs);
      }
    };

    return new Promise<void>((resolve, reject) => {
      poll(resolve, reject);
    });
  },

  async uploadAndWaitForVideo(file: File, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const video = await this.uploadVideo(file, onProgress);
      console.log('[Upload Result]', video);

      console.log('[Next Step] Starting to wait for processed video', { id: video.id, title: video.title });
      await this.waitForProcessedVideo(video.id, video.title);
    } catch (error) {
      console.error('[Process Error]', error);
      throw error;
    }
  }
};
