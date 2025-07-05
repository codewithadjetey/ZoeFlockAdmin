import React from "react";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  className = "",
  disabled = false
}) => {
  return (
    <div className="relative">
      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200"></i>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 search-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${className}`}
      />
    </div>
  );
};

export default SearchInput; 