import { useState, useEffect } from 'react';
import { api } from '../config/axios';
import { Video } from '../types/video';

export const useVideoHistory = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/videos');
      setVideos(response.data.filter((video: Video) => video.status === 'completed'));
      setError(null);
    } catch (err) {
      setError('Failed to load video history');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return { videos, loading, error, refetch: fetchVideos };
};