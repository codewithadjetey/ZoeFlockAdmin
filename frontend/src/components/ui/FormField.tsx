import React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, className = "" }) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
};

export default FormField; 