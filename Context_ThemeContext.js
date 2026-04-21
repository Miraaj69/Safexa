import React, { createContext, useContext } from 'react';
import { COLORS, SPACING, RADIUS } from './Constants_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ colors: COLORS, spacing: SPACING, radius: RADIUS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
