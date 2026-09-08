import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Rumbo del dispositivo vía DeviceOrientationEvent (brújula). En iOS requiere
 * pedir permiso explícito con un gesto del usuario -> se expone `requestPermission`.
 * Si el sensor no está disponible, el heading se calcula afuera (fallback GPS
 * en useSmoothPosition) y este hook simplemente reporta null.
 */
export function useHeading() {
  const [heading, setHeading] = useState(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const supportedRef = useRef(false);

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') return undefined;
    supportedRef.current = true;

    const needsIOSPermission = typeof DeviceOrientationEvent.requestPermission === 'function';
    setNeedsPermission(needsIOSPermission);

    const onOrientation = (event) => {
      // webkitCompassHeading: 0 = norte, sentido horario (iOS). alpha: antihorario -> se invierte.
      const compassHeading = event.webkitCompassHeading;
      if (typeof compassHeading === 'number' && !Number.isNaN(compassHeading)) {
        setHeading(compassHeading);
      } else if (typeof event.alpha === 'number' && event.absolute !== false) {
        setHeading((360 - event.alpha) % 360);
      }
    };

    if (!needsIOSPermission) {
      window.addEventListener('deviceorientationabsolute', onOrientation, true);
      window.addEventListener('deviceorientation', onOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrientation, true);
      window.removeEventListener('deviceorientation', onOrientation, true);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined' || typeof DeviceOrientationEvent.requestPermission !== 'function') {
      return true;
    }
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result === 'granted') {
        setNeedsPermission(false);
        const onOrientation = (event) => {
          const compassHeading = event.webkitCompassHeading;
          if (typeof compassHeading === 'number' && !Number.isNaN(compassHeading)) {
            setHeading(compassHeading);
          } else if (typeof event.alpha === 'number') {
            setHeading((360 - event.alpha) % 360);
          }
        };
        window.addEventListener('deviceorientation', onOrientation, true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return { heading, needsPermission, requestPermission };
}
