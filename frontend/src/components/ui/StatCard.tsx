import React from "react";

interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  description: string;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  value, 
  description,
  className = "",
  onClick,
  loading = false
}) => {
  return (
    <div 
      className={`stat-card rounded-3xl shadow-xl p-6 flex items-center cursor-pointer transition-all duration-300 hover:transform hover:scale-105 ${
        loading ? 'opacity-75' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className={`w-16 h-16 ${iconBgColor} rounded-2xl flex items-center justify-center mr-5 shadow-lg`}>
        <i className={`${icon} text-3xl ${iconColor}`}></i>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</dt>
        <dd className="text-3xl font-bold text-gray-900 dark:text-white">
          {loading ? (
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
          ) : (
            value
          )}
        </dd>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          {loading ? (
            <span className="inline-block animate-pulse bg-gray-300 dark:bg-gray-600 h-3 w-20 rounded"></span>
          ) : (
            description
          )}
        </p>
      </div>
    </div>
  );
};

export default StatCard; 