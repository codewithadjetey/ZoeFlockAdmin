import React from "react";

interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const SimpleInput: React.FC<SimpleInputProps> = ({ error, className = "", ...props }) => {
  return (
    <div>
      <input
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : ''
        } ${className}`}
      />
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default SimpleInput; 