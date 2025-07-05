import React from "react";

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 ${className}`}>
      {children}
    </div>
  );
};

export default ContentCard; 