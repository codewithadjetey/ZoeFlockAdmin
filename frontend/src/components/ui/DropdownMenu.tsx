import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child, { 
              onClick: () => setIsOpen(!isOpen),
              isOpen 
            });
          } else if (child.type === DropdownMenuContent && isOpen) {
            return child;
          }
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { onClick?: () => void; isOpen?: boolean }> = ({ 
  children, 
  asChild = false, 
  onClick,
  isOpen 
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick });
  }
  
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, className = "", align = "end" }) => {
  const getAlignClass = (align: string) => {
    switch (align) {
      case 'start':
        return 'left-0 origin-top-left';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2 origin-top';
      default:
        return 'right-0 origin-top-right';
    }
  };

  return (
    <div className={`absolute z-50 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${getAlignClass(align)} ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, onClick, className = "" }) => {
  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
