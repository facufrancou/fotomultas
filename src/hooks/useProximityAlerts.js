import { useEffect, useMemo, useRef } from 'react';
import { haversineDistance } from '../utils/geo.js';
import { useVoiceAlert } from './useVoiceAlert.js';

const LEVEL_RANK = { far: 0, early: 1, near: 2 };

function levelFor(distance, earlyRadius, nearRadius) {
  if (distance <= nearRadius) return 'near';
  if (distance <= earlyRadius) return 'early';
  return 'far';
}

/**
 * Calcula distancia Haversine a cada cámara sobre la posición YA suavizada
 * (no el fix crudo del GPS) y dispara voz + vibración al cruzar un umbral
 * de alerta hacia una zona más cercana (nunca al alejarse).
 */
export function useProximityAlerts({ position, cameras, earlyRadius, nearRadius, voiceEnabled, vibrationEnabled }) {
  const { speak } = useVoiceAlert(voiceEnabled);
  const levelsRef = useRef({});

  const camerasWithDistance = useMemo(() => {
    if (!position || position.lat == null) {
      return cameras.map((cam) => ({ ...cam, distance: Infinity, level: 'far' }));
    }
    return cameras
      .map((cam) => {
        const distance = haversineDistance(position.lat, position.lng, cam.lat, cam.lng);
        return { ...cam, distance, level: levelFor(distance, earlyRadius, nearRadius) };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [position, cameras, earlyRadius, nearRadius]);

  useEffect(() => {
    if (!position || position.lat == null) return;
    camerasWithDistance.forEach((cam) => {
      const prevLevel = levelsRef.current[cam.id] ?? 'far';
      if (cam.level !== prevLevel) {
        const gettingCloser = LEVEL_RANK[cam.level] > LEVEL_RANK[prevLevel];
        if (gettingCloser && cam.level !== 'far') {
          const roundedDistance = Math.max(50, Math.round(cam.distance / 50) * 50);
          speak(`Cámara a ${roundedDistance} metros, en ${cam.direccion}`);
          if (vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(cam.level === 'near' ? [90, 60, 90, 60, 140] : [110]);
          }
        }
        levelsRef.current[cam.id] = cam.level;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camerasWithDistance]);

  const nearest = camerasWithDistance.length > 0 && Number.isFinite(camerasWithDistance[0].distance)
    ? camerasWithDistance[0]
    : null;

  return { camerasWithDistance, nearest };
}
