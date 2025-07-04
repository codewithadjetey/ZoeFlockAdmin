"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME_COLORS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

interface ColorSwitcherProps {
  showDarkMode?: boolean;
  className?: string;
}

const ColorSwitcher: React.FC<ColorSwitcherProps> = ({ 
  showDarkMode = true, 
  className = "" 
}) => {
  const { currentTheme, colorMode, setTheme, toggleColorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colors = Object.values(THEME_COLORS);

  // Close dropdown when clicking outside
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

  const getCurrentThemeIcon = () => {
    const currentColor = colors.find(color => color.name === currentTheme);
    return currentColor?.icon || 'fas fa-palette';
  };

  const getCurrentThemeColor = () => {
    const currentColor = colors.find(color => color.name === currentTheme);
    return currentColor?.value || '#3b82f6';
  };

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName as any);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Single Theme Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        title="Theme Settings"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
        <i 
          className={cn(
            getCurrentThemeIcon(),
            "text-lg transition-all duration-300 hover:rotate-12 hover:scale-110"
          )}
          style={{ color: getCurrentThemeColor() }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 transform origin-top-right">
          <div className="p-4 space-y-4">
            {/* Dark Mode Toggle */}
            {showDarkMode && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <i className={cn(
                    colorMode === 'light' ? 'fas fa-moon' : 'fas fa-sun',
                    "text-gray-600 dark:text-gray-300"
                  )} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <button
                  onClick={toggleColorMode}
                  className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                    colorMode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>
            )}

            {/* Theme Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme Colors
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleThemeChange(color.name)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                      currentTheme === color.name
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'border border-transparent'
                    )}
                  >
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm",
                        color.bgClass
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="flex items-center space-x-2">
                      <i 
                        className={cn(
                          color.icon,
                          "text-sm transition-all duration-200 hover:scale-110"
                        )}
                        style={{ color: color.value }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {color.name}
                      </span>
                    </div>
                    {currentTheme === color.name && (
                      <i className="fas fa-check text-blue-600 dark:text-blue-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Theme Info */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: getCurrentThemeColor() }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Current: <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {currentTheme}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSwitcher; 