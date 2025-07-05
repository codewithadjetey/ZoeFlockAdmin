import React from "react";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  className = "" 
}) => {
  return (
    <div className="relative">
      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-3 search-input rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    </div>
  );
};

export default SearchInput; 