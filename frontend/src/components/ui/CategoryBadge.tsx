import React from "react";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = "" }) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "worship":
        return "bg-blue-100 text-blue-800";
      case "education":
        return "bg-green-100 text-green-800";
      case "prayer":
        return "bg-purple-100 text-purple-800";
      case "music":
        return "bg-orange-100 text-orange-800";
      case "fellowship":
        return "bg-pink-100 text-pink-800";
      case "ministry":
        return "bg-indigo-100 text-indigo-800";
      case "tithe":
        return "bg-green-100 text-green-800";
      case "offering":
        return "bg-blue-100 text-blue-800";
      case "building fund":
        return "bg-yellow-100 text-yellow-800";
      case "missions":
        return "bg-purple-100 text-purple-800";
      case "special project":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)} ${className}`}>
      {category}
    </span>
  );
};

export default CategoryBadge; 