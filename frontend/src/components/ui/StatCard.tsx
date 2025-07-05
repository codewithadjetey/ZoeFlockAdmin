import React from "react";

interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  description: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  value, 
  description,
  className = "" 
}) => {
  return (
    <div className={`stat-card rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default StatCard; 