import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'alerta-camaras:theme';

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // localStorage inaccesible (modo privado, etc.) -> usar default
  }
  return 'system';
}

export function ThemeProvider({ children }) {
  // "mode" es lo que eligió el usuario (o 'system'); "resolved" es light/dark efectivo.
  const [mode, setMode] = useState(readStoredMode);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = mode === 'system' ? systemTheme : mode;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // sin persistencia disponible, seguimos igual en esta sesión
    }
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      root.setAttribute('data-theme', resolved);
    };
    // Crossfade suave entre temas usando View Transitions API cuando está disponible.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced && document.startViewTransition) {
      document.startViewTransition(applyTheme);
    } else {
      root.classList.add('theme-fade');
      applyTheme();
      window.setTimeout(() => root.classList.remove('theme-fade'), 400);
    }
  }, [resolved]);

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const currentResolved = current === 'system' ? getSystemTheme() : current;
      return currentResolved === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ mode, resolved, setMode, toggleTheme }),
    [mode, resolved, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
