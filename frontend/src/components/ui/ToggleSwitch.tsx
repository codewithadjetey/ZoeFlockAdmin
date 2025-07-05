import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  label,
  description,
  className = "",
  disabled = false
}) => {
  return (
    <div className={`flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 ${
      disabled ? 'opacity-60' : ''
    } ${className}`}>
      {(label || description) && (
        <div>
          {label && <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{label}</h4>}
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{description}</p>}
        </div>
      )}
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${
          checked 
            ? "bg-gradient-to-r from-primary-500 to-primary-600" 
            : "bg-gray-300 dark:bg-gray-600"
        } ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
        }`}
      >
        <div className={`w-5 h-5 bg-white dark:bg-gray-200 rounded-full transition-all duration-300 shadow-md ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}></div>
      </button>
    </div>
  );
};

export default ToggleSwitch; 