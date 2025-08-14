import React from "react";

interface CategoryBadgeProps {
  category: string;
  variant?: 'success' | 'warning' | 'secondary' | 'default';
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, variant = 'default', className = "" }) => {
  const getCategoryColor = (category: string, variant: string) => {
    // If variant is specified, use it
    if (variant !== 'default') {
      switch (variant) {
        case 'success':
          return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400";
        case 'warning':
          return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-400";
        case 'secondary':
          return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
        default:
          return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-400";
      }
    }

    // Otherwise, use the original category-based logic
    switch (category.toLowerCase()) {
      case "worship":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-400";
      case "education":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400";
      case "prayer":
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-400";
      case "music":
        return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/20 dark:to-orange-800/20 dark:text-orange-400";
      case "fellowship":
        return "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 dark:from-pink-900/20 dark:to-pink-800/20 dark:text-pink-400";
      case "ministry":
        return "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:text-indigo-400";
      case "tithe":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400";
      case "offering":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-400";
      case "building fund":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-400";
      case "missions":
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-400";
      case "special project":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400";
      case "individual":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400";
      case "general":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-400";
      case "none":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-200 ${getCategoryColor(category, variant)} ${className}`}>
      {category}
    </span>
  );
};

export default CategoryBadge; 