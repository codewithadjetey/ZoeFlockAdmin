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
    <div className="flex items-center justify-between my-4 md:my-6 relative z-10 view-toggle-container" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">View:</span>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
          {options.map((option) => (
            <button
              key={option.value}
              data-view-toggle={option.value}
              onClick={(e) => handleViewModeChange(option.value, e)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                value === option.value
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <i className={`${option.icon} mr-1`}></i>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {count !== undefined && (
        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          <span>{count} {countLabel}</span>
        </div>
      )}
    </div>
  );
};

export default ViewToggle; 