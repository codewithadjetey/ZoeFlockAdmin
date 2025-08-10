import React from "react";

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  name,
  className = "",
  disabled = false,
  min,
  max,
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">{label}</label>
    )}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 outline-none transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md focus:shadow-lg ${
        error ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' : ''
      } ${
        disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''
      } ${className}`}
    />
    {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1 transition-colors duration-200">{error}</p>}
  </div>
);

export default TextInput; 