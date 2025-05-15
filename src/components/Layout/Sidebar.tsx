import React from 'react';
import { Shield } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-dark-600 h-full overflow-hidden flex flex-col bg-gray-50 dark:bg-dark-800">
      <div className="p-4 border-b border-gray-200 dark:border-dark-600">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary-500" />
          <h2 className="text-lg font-semibold">SecureVision</h2>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Upload and analyze security footage
        </p>
      </div>
    </div>
  );
};

export default Sidebar;