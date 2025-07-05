"use client";
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ColorSwitcherProps {
  className?: string;
}

const ColorSwitcher: React.FC<ColorSwitcherProps> = ({ className = "" }) => {
  const { currentTheme, setTheme, themeColors } = useTheme();

  const colors = [
    { name: 'blue', label: 'Blue', color: '#3b82f6' },
    { name: 'green', label: 'Green', color: '#10b981' },
    { name: 'purple', label: 'Purple', color: '#8b5cf6' },
    { name: 'orange', label: 'Orange', color: '#f59e0b' },
    { name: 'pink', label: 'Pink', color: '#ec4899' },
  ] as const;

  return (
    <div className={`flex space-x-2 ${className}`}>
      {colors.map((colorOption) => (
        <button
          key={colorOption.name}
          onClick={() => setTheme(colorOption.name)}
          className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
            currentTheme === colorOption.name
              ? 'border-white shadow-lg scale-110'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{ backgroundColor: colorOption.color }}
          title={colorOption.label}
          aria-label={`Switch to ${colorOption.label} theme`}
        >
          {currentTheme === colorOption.name && (
            <div className="w-full h-full flex items-center justify-center">
              <i className="fas fa-check text-white text-sm"></i>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ColorSwitcher; 