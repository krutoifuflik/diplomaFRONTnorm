import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';
import { cn } from '../../utils/cn';

export const HealthIndicator: React.FC = () => {
  const { status } = useHealth();
  const isHealthy = status.api;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full",
        "bg-white dark:bg-dark-700 shadow-lg",
        "transition-colors duration-200"
      )}>
        {isHealthy ? (
          <>
            <Wifi className="h-4 w-4 text-success" />
            <span className="text-sm text-success">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-danger" />
            <span className="text-sm text-danger">Server Offline</span>
          </>
        )}
      </div>
    </motion.div>
  );
};