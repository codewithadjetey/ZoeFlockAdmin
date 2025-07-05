import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "" 
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
    </div>
  );
};

export default SelectInput; 