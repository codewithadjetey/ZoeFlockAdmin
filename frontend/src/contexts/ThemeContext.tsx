"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';
type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  currentTheme: ThemeColor;
  colorMode: ColorMode;
  setTheme: (color: ThemeColor) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
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
  const [colorMode, setColorModeState] = useState<ColorMode>('light');

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

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem('color-mode', mode);
    
    // Update HTML class for Tailwind dark mode
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
  };

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme-color') as ThemeColor;
    const savedColorMode = localStorage.getItem('color-mode') as ColorMode;
    
    if (savedTheme && themeColors[savedTheme]) {
      setCurrentTheme(savedTheme);
      document.documentElement.style.setProperty('--theme-color', themeColors[savedTheme]);
    } else {
      // Set default theme
      document.documentElement.style.setProperty('--theme-color', themeColors.blue);
    }

    // Load color mode
    if (savedColorMode) {
      setColorModeState(savedColorMode);
      if (savedColorMode === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setColorModeState('dark');
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      colorMode, 
      setTheme, 
      setColorMode, 
      toggleColorMode, 
      themeColors 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 