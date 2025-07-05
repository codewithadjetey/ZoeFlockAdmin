"use client";
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ColorSwitcherProps {
  showDarkMode?: boolean;
  className?: string;
}

const ColorSwitcher: React.FC<ColorSwitcherProps> = ({ 
  showDarkMode = true, 
  className = "" 
}) => {
  const { 
    currentTheme, 
    colorMode, 
    setTheme, 
    toggleColorMode, 
    themeColors 
  } = useTheme();

  const colors = [
    { name: 'blue', value: '#3b82f6' },
    { name: 'green', value: '#10b981' },
    { name: 'purple', value: '#8b5cf6' },
    { name: 'orange', value: '#f59e0b' },
    { name: 'pink', value: '#ec4899' },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Modern Dark Mode Toggle */}
      {showDarkMode && (
        <button
          onClick={toggleColorMode}
          className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          title={colorMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
          {colorMode === 'light' ? (
            <i className="fas fa-moon text-gray-600 dark:text-gray-300 text-lg transition-transform duration-300 hover:rotate-12"></i>
          ) : (
            <i className="fas fa-sun text-yellow-500 text-lg transition-transform duration-300 hover:rotate-12"></i>
          )}
        </button>
      )}

      {/* Modern Theme Color Switcher */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => setTheme(color.name as any)}
            className={`relative w-8 h-8 rounded-lg border-2 transition-all duration-300 transform hover:scale-110 ${
              currentTheme === color.name
                ? 'border-white dark:border-gray-800 shadow-lg scale-110 ring-2 ring-blue-500 ring-opacity-50'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            style={{ backgroundColor: color.value }}
            title={`Switch to ${color.name} theme`}
          >
            {currentTheme === color.name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-check text-white text-xs"></i>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSwitcher; 