import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const SelectInput: React.FC<SelectInputProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  label,
  error,
  disabled = false,
  children
}) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 cursor-pointer transition-all duration-300 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg ${
          error ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' : ''
        } ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''
        } ${className}`}
      >
        {placeholder && <option value="" className="text-gray-500 dark:text-gray-400">{placeholder}</option>}
        {children ? (
          children
        ) : options ? (
          options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900 dark:text-white">
              {option.label}
            </option>
          ))
        ) : null}
      </select>
      <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors duration-200"></i>
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1 transition-colors duration-200">{error}</p>}
    </div>
  );
};

export default SelectInput; 