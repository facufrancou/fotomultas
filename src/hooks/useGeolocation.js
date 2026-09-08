import { useEffect, useRef, useState } from 'react';

const WATCH_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000,
};

/**
 * Suscribe a navigator.geolocation.watchPosition y expone el fix más reciente
 * tal cual llega del GPS (sin suavizar). El suavizado real vive en useSmoothPosition.
 */
export function useGeolocation() {
  const [state, setState] = useState({
    fix: null, // { lat, lng, accuracy, speed, heading, timestamp }
    error: null,
    status: 'idle', // idle | locating | ready | error
  });
  const lastFixRef = useRef(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ fix: null, error: 'Geolocalización no disponible en este navegador.', status: 'error' });
      return undefined;
    }

    setState((s) => ({ ...s, status: 'locating' }));

    const onSuccess = (pos) => {
      const { latitude, longitude, accuracy, speed, heading } = pos.coords;
      const fix = {
        lat: latitude,
        lng: longitude,
        accuracy,
        speed: typeof speed === 'number' && speed >= 0 ? speed : null,
        heading: typeof heading === 'number' && !Number.isNaN(heading) ? heading : null,
        timestamp: pos.timestamp,
        prevFix: lastFixRef.current,
      };
      lastFixRef.current = fix;
      setState({ fix, error: null, status: 'ready' });
    };

    const onError = (err) => {
      setState((s) => ({ ...s, error: err.message, status: s.fix ? 'ready' : 'error' }));
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, WATCH_OPTIONS);
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
