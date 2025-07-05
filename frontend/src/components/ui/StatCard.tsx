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
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  value, 
  description,
  className = "",
  onClick
}) => {
  return (
    <div 
      className={`stat-card rounded-3xl shadow-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-200">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{description}</p>
    </div>
  );
};

export default StatCard; 