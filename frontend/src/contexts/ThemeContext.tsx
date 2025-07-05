"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

interface ThemeContextType {
  currentTheme: ThemeColor;
  setTheme: (color: ThemeColor) => void;
  themeColors: Record<ThemeColor, string>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('blue');

  const themeColors: Record<ThemeColor, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    pink: '#ec4899',
  };

  const setTheme = (color: ThemeColor) => {
    setCurrentTheme(color);
    // Store in localStorage
    localStorage.setItem('theme-color', color);
    // Update CSS custom properties
    document.documentElement.style.setProperty('--theme-color', themeColors[color]);
  };

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme-color') as ThemeColor;
    if (savedTheme && themeColors[savedTheme]) {
      setCurrentTheme(savedTheme);
      document.documentElement.style.setProperty('--theme-color', themeColors[savedTheme]);
    } else {
      // Set default theme
      document.documentElement.style.setProperty('--theme-color', themeColors.blue);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}; 