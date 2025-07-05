import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  label,
  description,
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-xl ${className}`}>
      {(label || description) && (
        <div>
          {label && <h4 className="font-medium text-gray-900">{label}</h4>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}></div>
      </button>
    </div>
  );
};

export default ToggleSwitch; 