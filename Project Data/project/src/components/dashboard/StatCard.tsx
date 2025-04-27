import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor,
  iconBgColor,
  changeType = 'neutral'
}) => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div 
            className={`rounded-full p-3 mr-4 ${iconBgColor}`}
          >
            <div className={iconColor}>{icon}</div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-semibold mt-1">
              {value}
            </p>
          </div>
        </div>
        
        {change !== undefined && (
          <div className="mt-3 flex items-center text-sm">
            <span className={`mr-1 ${
              changeType === 'increase' ? 'text-green-500' : 
              changeType === 'decrease' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {changeType === 'increase' ? '↑' : 
               changeType === 'decrease' ? '↓' : '∞'}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              from previous period
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;