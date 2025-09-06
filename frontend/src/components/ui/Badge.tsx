import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'secondary':
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
      case 'outline':
        return "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
      case 'destructive':
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/80";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
