import React from "react";
import clsx from "clsx";

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
};

const variantClasses = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white",
  secondary: "bg-neutral-200 hover:bg-neutral-300 text-neutral-900",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
        variantClasses[variant],
        disabled || loading ? "opacity-60 cursor-not-allowed" : "",
        className
      )}
    >
      {icon && iconPosition === "left" && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      {loading ? <span>Loading...</span> : children}
      {icon && iconPosition === "right" && (
        <span className="ml-2 flex items-center">{icon}</span>
      )}
    </button>
  );
};

export default Button; 