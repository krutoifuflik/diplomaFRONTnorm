import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-dark-600 h-full overflow-hidden flex flex-col bg-gray-50 dark:bg-dark-800">
      <div className="p-6 border-b border-gray-200 dark:border-dark-600">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong>SecureVision</strong> is an AI-powered system for analyzing surveillance footage.
          It automatically detects weapons, suspicious objects, and unusual behavior.
          <br /><br />
          Upload your video to receive a processed version with visual annotations and a detailed report of detected threats.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
