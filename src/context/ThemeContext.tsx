import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, ThemeName, Theme } from '../themes';

const STORAGE_KEY = 'leanCoffee_theme';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in themes) return stored as ThemeName;
  } catch {}
  return 'notion';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(loadTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, themeName);
    } catch {}
  }, [themeName]);

  const value: ThemeContextValue = {
    theme: themes[themeName],
    themeName,
    setTheme: setThemeName,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
