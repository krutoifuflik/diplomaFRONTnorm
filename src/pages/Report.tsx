import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Video, CheckCircle, XCircle, Clock } from 'lucide-react';
import { videoService } from '../services/videoService';
import { Detection } from '../types';

interface VideoReport {
  detections: Detection[];
  accuracy: number;
  reviewed: boolean;
  reviewedAt: string | null;
}

const Report: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<VideoReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const detections = await videoService.getVideoReport(id!);
        setReport({
          detections,
          accuracy: Math.random() * 0.2 + 0.8, // Mock accuracy between 80-100%
          reviewed: Math.random() > 0.5,
          reviewedAt: Math.random() > 0.5 ? new Date().toISOString() : null
        });
      } catch (err) {
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Report not found'}</p>
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
              to={`/video/${id}`}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Video
            </Link>
            <h1 className="text-2xl font-bold">Analysis Report</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mr-2">Accuracy:</div>
              <div className="text-lg font-bold text-primary-500">
                {(report.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mr-2">Status:</div>
              {report.reviewed ? (
                <div className="flex items-center text-success">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>Reviewed</span>
                </div>
              ) : (
                <div className="flex items-center text-warning">
                  <XCircle className="h-5 w-5 mr-1" />
                  <span>Pending Review</span>
                </div>
              )}
            </div>
            
            {report.reviewedAt && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  Reviewed on {new Date(report.reviewedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <pre className="bg-gray-100 dark:bg-dark-800 rounded-lg p-4 overflow-auto">
              <code className="text-sm">
                {JSON.stringify(report.detections, null, 2)}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;