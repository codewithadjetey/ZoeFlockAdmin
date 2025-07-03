import React from "react";

interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  error?: string;
  name?: string;
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  error,
  name,
  className = "",
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white shadow-sm focus:shadow-md appearance-none ${error ? 'border-red-500' : ''} ${className}`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default SelectInput; 