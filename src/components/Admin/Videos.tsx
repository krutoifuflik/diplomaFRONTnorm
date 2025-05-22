import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Download, AlertCircle, Loader } from 'lucide-react';
import { api } from '../../config/axios';
import { Video } from '../../types/video';
import { formatDuration } from '../../utils/validation';
import { toast } from 'react-hot-toast';
import { videoService } from '../../services/videoService';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/videos');
      
      // Transform the raw API data into our Video type
      const transformedVideos = response.data.map((video: any) => ({
        id: video.id,
        title: video.original_filename || 'Untitled',
        duration: video.duration || 0,
        status: video.status || 'pending',
        url: video.storage_path || '',
        thumbnail: video.thumbnail_url || '',
        uploadDate: new Date(video.uploaded_at || Date.now()),
        resolution: video.resolution || 'Unknown',
        fps: video.fps || 0,
        fileSize: video.file_size || 0,
        tags: video.tags || [],
        userId: video.user_id || ''
      }));

      setVideos(transformedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to fetch videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/videos/${videoId}`);
      setVideos(videos.filter(video => video.id !== videoId));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const handleDownloadReport = async (videoId: string, videoTitle: string) => {
    try {
      const report = await videoService.getVideoReport(videoId);
      const jsonString = JSON.stringify(report.detection_json, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoTitle.replace(/\s+/g, '_')}_report.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleUpdate = async () => {
    try {
      // Refresh the token
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      
      // Update the token in localStorage and axios headers
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Refetch videos with new token
      await fetchVideos();
      toast.success('Videos updated successfully');
    } catch (err) {
      toast.error('Failed to update videos');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Update Videos'}
        </button>
      </div>

      <div className="bg-white dark:bg-dark-700 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead className="bg-gray-50 dark:bg-dark-800">
            <tr>
              <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upload Date
              </th>
              <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-700 divide-y divide-gray-200 dark:divide-dark-600">
            {videos.length > 0 ? (
              videos.map((video) => (
                <motion.tr
                  key={video.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-dark-600"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                    {video.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(video.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(video.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDownloadReport(video.id, video.title)}
                        className="text-gray-600 hover:text-primary-500 transition-colors"
                        title="Download Report"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                        title="Delete Video"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    {loading ? (
                      <>
                        <Loader className="h-8 w-8 mb-2 animate-spin" />
                        <p>Loading videos...</p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                        <p>No videos found</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Videos;