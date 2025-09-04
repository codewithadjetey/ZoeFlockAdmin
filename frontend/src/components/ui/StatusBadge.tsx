import React from "react";

interface StatusBadgeProps {
  status?: string;
  variant?: 'success' | 'warning' | 'danger' | 'secondary' | 'default';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default', className = "" }) => {
  const getStatusColor = (status: string | undefined, variant: string) => {
    // Handle undefined status
    if (!status) {
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
    }

    // If variant is specified, use it
    if (variant !== 'default') {
      switch (variant) {
        case 'success':
          return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400";
        case 'warning':
          return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-400";
        case 'danger':
          return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400";
        case 'secondary':
          return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
        default:
          return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-400";
      }
    }

    // Otherwise, use the original status-based logic
    switch (status.toLowerCase()) {
      case "active":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400";
      case "inactive":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400";
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-400";
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-400";
      case "failed":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400";
      case "new":
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-400";
      case "published":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400";
      case "draft":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400";
      case "recurring":
        return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/20 dark:to-orange-800/20 dark:text-orange-400";
      case "one-time":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-200 ${getStatusColor(status, variant)} ${className}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge; 