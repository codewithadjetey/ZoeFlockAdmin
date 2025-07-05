import React from "react";

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default ContentCard; 