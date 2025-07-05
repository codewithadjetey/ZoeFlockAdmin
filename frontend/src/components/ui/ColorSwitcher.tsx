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
      {/* Dark Mode Toggle */}
      {showDarkMode && (
        <button
          onClick={toggleColorMode}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
          title={colorMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {colorMode === 'light' ? (
            <i className="fas fa-moon text-gray-600 dark:text-gray-300"></i>
          ) : (
            <i className="fas fa-sun text-yellow-500"></i>
          )}
        </button>
      )}

      {/* Theme Color Switcher */}
      <div className="flex items-center gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => setTheme(color.name as any)}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
              currentTheme === color.name
                ? 'border-white dark:border-gray-800 shadow-lg scale-110'
                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
            }`}
            style={{ backgroundColor: color.value }}
            title={`Switch to ${color.name} theme`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSwitcher; 