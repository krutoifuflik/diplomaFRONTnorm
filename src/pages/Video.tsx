import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileJson } from 'lucide-react';
import { videoService } from '../services/videoService';
import { Video as VideoType } from '../types/video';
import VideoPlayer from '../components/Video/VideoPlayer';

const Video: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to dashboard if no ID is provided
    if (!id) {
      navigate('/dashboard');
      return;
    }

    const fetchVideo = async () => {
      try {
        const response = await videoService.getVideoById(id);
        setVideo(response);
      } catch (err) {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Video not found'}</p>
          <Link to="/dashboard" className="text-primary-500 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">{video.title}</h1>
          </div>
          
          <Link
            to={`/report/${video.id}`}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FileJson className="h-5 w-5 mr-2" />
            View Report
          </Link>
        </div>

        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-lg overflow-hidden">
          <VideoPlayer videoId={video.id} />
        </div>
      </div>
    </div>
  );
};

export default Video;