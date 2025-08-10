import React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string | Record<string, string>;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, className = "", error }) => {
  const getErrorMessage = (error: string | Record<string, string> | undefined): string => {
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error === 'object' && error !== null) {
      // For nested errors, we'll just show the first error message
      const firstError = Object.values(error)[0];
      return typeof firstError === 'string' ? firstError : '';
    }
    return '';
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage(error)}</p>
      )}
    </div>
  );
};

export default FormField; 