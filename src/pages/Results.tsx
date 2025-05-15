import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Download } from 'lucide-react';
import { videoService } from '../services/videoService';
import { Detection } from '../types';
import VideoPlayer from '../components/Video/VideoPlayer';
import { motion } from 'framer-motion';

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const reportData = await videoService.getVideoReport(id);
        setDetections(reportData);
      } catch (err) {
        setError('Failed to load video report');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadReport = async () => {
    if (!id) return;

    try {
      const jsonString = JSON.stringify(detections, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_${id}_report.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !id) {
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
            <h1 className="text-2xl font-bold">Analysis Results</h1>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-700 rounded-lg shadow-lg overflow-hidden"
          >
            <VideoPlayer videoId={id!} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-700 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Detection Report</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {detections.length} detections found
              </div>
            </div>

            <div className="space-y-4">
              {detections.map((detection, index) => (
                <motion.div
                  key={detection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      detection.objectType === 'person' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      detection.objectType === 'gun' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {detection.objectType}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(detection.timestamp * 1000).toISOString().substr(11, 8)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{detection.description}</p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Confidence: {(detection.confidence * 100).toFixed(2)}%
                  </div>
                </motion.div>
              ))}
              {detections.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No detections found in this video
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Results;
