import React, {createContext, useContext, useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Colors = {
  bg: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  filterInactive: string;
  isDark: boolean;
};

export type FontSizeKey = 'small' | 'medium' | 'large';

export const FONT_SCALE: Record<FontSizeKey, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
};

const light: Colors = {
  bg: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  subText: '#888888',
  border: '#E0E0E0',
  filterInactive: '#E0E0E0',
  isDark: false,
};

const dark: Colors = {
  bg: '#0F1117',
  card: '#1E1E2E',
  text: '#F0F0F5',
  subText: '#9E9E9E',
  border: '#2E2E3E',
  filterInactive: '#2A2A3A',
  isDark: true,
};

type ThemeContextType = {
  colors: Colors;
  isDark: boolean;
  toggleTheme: () => void;
  fontScale: number;
  fontSizeKey: FontSizeKey;
  setFontSize: (key: FontSizeKey) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: light,
  isDark: false,
  toggleTheme: () => {},
  fontScale: 1.0,
  fontSizeKey: 'medium',
  setFontSize: () => {},
});

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [fontSizeKey, setFontSizeKey] = useState<FontSizeKey>('medium');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('darkMode'),
      AsyncStorage.getItem('fontSize'),
    ]).then(([dark, font]) => {
      if (dark !== null) {setIsDark(dark === '1');}
      if (font !== null) {setFontSizeKey(font as FontSizeKey);}
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('darkMode', next ? '1' : '0');
      return next;
    });
  };

  const setFontSize = (key: FontSizeKey) => {
    setFontSizeKey(key);
    AsyncStorage.setItem('fontSize', key);
  };

  return (
    <ThemeContext.Provider
      value={{
        colors: isDark ? dark : light,
        isDark,
        toggleTheme,
        fontScale: FONT_SCALE[fontSizeKey],
        fontSizeKey,
        setFontSize,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
