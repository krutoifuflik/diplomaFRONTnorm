import React from 'react';
import UploadZone from '../Upload/UploadZone';

const MainContent: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-full p-8">
        <UploadZone />
      </div>
    </div>
  );
};

export default MainContent;