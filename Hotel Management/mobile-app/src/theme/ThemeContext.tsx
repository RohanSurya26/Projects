import React, { createContext, useContext, useState, useMemo } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentDark: string;
  success: string;
  warning: string;
  danger: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
  statusBarStyle: 'light' | 'dark';
}

const darkColors: ThemeColors = {
  bg: '#080b16',
  card: '#111827',
  cardAlt: '#1e293b',
  border: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  accent: '#6C63FF',
  accentDark: '#4834DF',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  inputBg: '#0f172a',
  tabBar: '#111827',
  tabBarBorder: '#1e293b',
  statusBarStyle: 'light',
};

const lightColors: ThemeColors = {
  bg: '#f5f7fb',
  card: '#ffffff',
  cardAlt: '#f1f5f9',
  border: '#e2e8f0',
  text: '#1a1a2e',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  accent: '#6C63FF',
  accentDark: '#4834DF',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  inputBg: '#f1f5f9',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  statusBarStyle: 'dark',
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: darkColors,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggle = () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    toggle,
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
