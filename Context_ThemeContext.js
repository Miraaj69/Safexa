import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, SEMANTIC, SPACING, RADIUS, FONT, SHADOW } from './Constants_theme';

const ThemeContext = createContext(null);
const THEME_KEY = 'safexa_theme';

export function ThemeProvider({ children }) {
  const [themeName, setThemeNameState] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved && THEMES[saved]) setThemeNameState(saved);
    });
  }, []);

  const setTheme = (name) => {
    if (!THEMES[name]) return;
    setThemeNameState(name);
    AsyncStorage.setItem(THEME_KEY, name);
  };

  const themeColors = { ...THEMES[themeName], ...SEMANTIC };

  // Convenience: card style matching current theme
  const cardStyle = {
    backgroundColor: themeColors.bgCard,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     themeColors.border,
    ...SHADOW.card,
  };

  return (
    <ThemeContext.Provider value={{
      theme:      themeName,
      setTheme,
      colors:     themeColors,
      spacing:    SPACING,
      radius:     RADIUS,
      font:       FONT,
      shadow:     SHADOW,
      cardStyle,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
