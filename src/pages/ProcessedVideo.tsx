import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileJson, AlertCircle } from 'lucide-react';
import { videoService } from '../services/videoService';
import { Video as VideoType } from '../types/video';
import { Detection } from '../types';
import VideoPlayer from '../components/Video/VideoPlayer';

const ProcessedVideo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const fetchProcessedVideo = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [videoData, reportData, videoBlob] = await Promise.all([
          videoService.getVideoById(id),
          videoService.getVideoReport(id),
          videoService.getProcessedVideo(id, 'video')
        ]);
        
        setVideo(videoData);
        setDetections(reportData);
        setVideoBlob(videoBlob);
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError('Failed to load video and report');
      } finally {
        setLoading(false);
      }
    };

    fetchProcessedVideo();
  }, [id]);

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
          <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" />
          <p className="text-danger mb-4">{error || 'Video not found'}</p>
          <Link to="/dashboard" className="text-primary-500 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleDownloadReport = () => {
    if (!id || !video.title) return;
    videoService.downloadReport(id, video.title);
  };

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-700 rounded-lg shadow-lg overflow-hidden">
            {videoBlob && (
              <video
                className="w-full h-full"
                controls
                autoPlay
                playsInline
                src={URL.createObjectURL(videoBlob)}
              />
            )}
          </div>

          <div className="bg-white dark:bg-dark-700 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Analysis Report</h2>
              <button
                onClick={handleDownloadReport}
                className="flex items-center px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              >
                <FileJson className="h-4 w-4 mr-2" />
                Download JSON
              </button>
            </div>
            <div className="bg-gray-100 dark:bg-dark-800 rounded-lg p-4 overflow-auto max-h-[600px]">
              <pre className="text-sm">
                <code>
                  {JSON.stringify(detections, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessedVideo;
