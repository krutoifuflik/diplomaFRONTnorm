import React from 'react';
import UploadZone from '../Upload/UploadZone';

interface MainContentProps {
  selectedVideo?: string;
  selectedReport?: any;
}

const MainContent: React.FC<MainContentProps> = ({ selectedVideo, selectedReport }) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-full p-8">
        <UploadZone initialVideo={selectedVideo} initialReport={selectedReport} />
      </div>
    </div>
  );
};

export default MainContent;