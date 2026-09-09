import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_THEME, createTheme } from './ThemeConstants';
import { SmokeTheme, ThemeContextType } from '../interfaces/theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<SmokeTheme>(DEFAULT_THEME);

  const updateThemeFromSystem = useCallback((
    primary: string,
    offset: string,
    background: string,
    border: string,
    backgroundUrl?: string
  ) => {
    setTheme((prevTheme) => {
      if (
        prevTheme.PRIMARY === primary
        && prevTheme.OFFSET === offset
        && prevTheme.BACKGROUND === background
        && prevTheme.BORDER === border
        && prevTheme.BACKGROUND_URL === (backgroundUrl || undefined)
      ) {
        return prevTheme;
      }

      return createTheme(primary, offset, background, border, backgroundUrl);
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, updateThemeFromSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useSmokeTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSmokeTheme must be used within a ThemeProvider');
  }
  return context;
};
