import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { VEHICLES } from '../assets/vehicles/vehicleShapes.js';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'alerta-camaras:settings';

const defaultSettings = {
  vehicleId: VEHICLES[0].id,
  voiceEnabled: true,
  vibrationEnabled: true,
  earlyRadius: 500,
  nearRadius: 100,
  units: 'metric',
};

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VEHICLE':
      return { ...state, vehicleId: action.vehicleId };
    case 'TOGGLE_VOICE':
      return { ...state, voiceEnabled: !state.voiceEnabled };
    case 'TOGGLE_VIBRATION':
      return { ...state, vibrationEnabled: !state.vibrationEnabled };
    case 'SET_RADII':
      return { ...state, earlyRadius: action.earlyRadius, nearRadius: action.nearRadius };
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [settings, dispatch] = useReducer(reducer, undefined, readStoredSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // sin persistencia disponible, seguimos igual en esta sesión
    }
  }, [settings]);

  const value = useMemo(() => ({ settings, dispatch }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de SettingsProvider');
  return ctx;
}
