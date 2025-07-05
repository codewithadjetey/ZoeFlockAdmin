import React from "react";

interface ViewToggleOption {
  value: string;
  label: string;
  icon: string;
}

interface ViewToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: ViewToggleOption[];
  count?: number;
  countLabel?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ 
  value, 
  onChange, 
  options, 
  count,
  countLabel 
}) => {
  const handleViewModeChange = (mode: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onChange(mode);
  };

  return (
    <div className="flex items-center justify-between mt-6 relative z-10 view-toggle-container" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">View:</span>
        <div className="flex bg-gray-100 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
          {options.map((option) => (
            <button
              key={option.value}
              data-view-toggle={option.value}
              onClick={(e) => handleViewModeChange(option.value, e)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                value === option.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <i className={`${option.icon} mr-1`}></i>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {count !== undefined && (
        <div className="text-sm text-gray-500">
          <span>{count} {countLabel}</span>
        </div>
      )}
    </div>
  );
};

export default ViewToggle; 