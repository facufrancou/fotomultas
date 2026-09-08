import { useEffect, useMemo, useRef, useState } from 'react';
import { bearingBetween, destinationPoint, haversineDistance, lerp, lerpAngle } from '../utils/geo.js';

const DEFAULT_SEGMENT_MS = 1000; // supuesto hasta tener dos fixes reales
const MIN_SEGMENT_MS = 200;
const MAX_SEGMENT_MS = 3000;
const DEAD_RECKONING_LIMIT_MS = 1500;
const MIN_MOVE_FOR_BEARING_M = 3; // por debajo de esto, el rumbo por GPS es puro ruido
const SAMPLE_INTERVAL_MS = 150; // frecuencia del estado "para React" (HUD, anillos)

/**
 * Suaviza los fixes crudos del GPS en un movimiento continuo a 60fps.
 * No usa setState por frame: expone una ref mutable + un sistema de suscripción
 * imperativo para que el marcador de Leaflet se mueva sin pasar por React,
 * y un estado muestreado a baja frecuencia (~6-7Hz) para el HUD.
 */
export function useSmoothPosition(fix, sensorHeading) {
  const stateRef = useRef({ lat: null, lng: null, heading: 0, speed: 0, hasFix: false });
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const segmentDurationRef = useRef(DEFAULT_SEGMENT_MS);
  const lastFixAtRef = useRef(0);
  const subscribersRef = useRef(new Set());
  const rafRef = useRef(null);
  const lastSampleAtRef = useRef(0);
  const sensorHeadingRef = useRef(sensorHeading);
  const lastHeadingRef = useRef(0);

  const [sampled, setSampled] = useState(stateRef.current);

  sensorHeadingRef.current = sensorHeading;

  // --- Ingesta de un nuevo fix: recalcula el segmento de interpolación ---
  useEffect(() => {
    if (!fix) return;
    const now = performance.now();
    const prev = fix.prevFix;

    let resolvedHeading = lastHeadingRef.current;
    if (typeof sensorHeadingRef.current === 'number') {
      resolvedHeading = sensorHeadingRef.current;
    } else if (typeof fix.heading === 'number') {
      resolvedHeading = fix.heading;
    } else if (prev) {
      const moved = haversineDistance(prev.lat, prev.lng, fix.lat, fix.lng);
      if (moved >= MIN_MOVE_FOR_BEARING_M) {
        resolvedHeading = bearingBetween(prev.lat, prev.lng, fix.lat, fix.lng);
      }
    }
    lastHeadingRef.current = resolvedHeading;

    const isFirstFix = !stateRef.current.hasFix;

    if (isFirstFix) {
      stateRef.current = {
        lat: fix.lat,
        lng: fix.lng,
        heading: resolvedHeading,
        speed: fix.speed ?? 0,
        hasFix: true,
      };
      fromRef.current = { ...stateRef.current, t: now };
      toRef.current = { ...stateRef.current, t: now };
      segmentDurationRef.current = DEFAULT_SEGMENT_MS;
    } else {
      // Arrancamos el nuevo segmento desde donde el marcador está *ahora mismo*
      // (interpolado), no desde el último fix crudo, para que no haya saltos.
      fromRef.current = { ...stateRef.current, t: now };
      toRef.current = {
        lat: fix.lat,
        lng: fix.lng,
        heading: resolvedHeading,
        speed: fix.speed ?? 0,
        t: now,
      };
      const interval = lastFixAtRef.current ? now - lastFixAtRef.current : DEFAULT_SEGMENT_MS;
      segmentDurationRef.current = Math.min(MAX_SEGMENT_MS, Math.max(MIN_SEGMENT_MS, interval));
    }
    lastFixAtRef.current = now;
  }, [fix]);

  // --- Loop de animación: interpola / hace dead reckoning cada frame ---
  useEffect(() => {
    const tick = () => {
      const to = toRef.current;
      const from = fromRef.current;
      if (to && from) {
        const now = performance.now();
        const elapsed = now - to.t;
        const duration = segmentDurationRef.current;
        const t = duration > 0 ? Math.min(1, elapsed / duration) : 1;

        let lat, lng, heading, speed;
        if (t < 1) {
          lat = lerp(from.lat, to.lat, t);
          lng = lerp(from.lng, to.lng, t);
          heading = lerpAngle(from.heading, to.heading, t);
          speed = lerp(from.speed, to.speed, t);
        } else {
          // Dead reckoning: no llegó fix nuevo a tiempo, seguimos proyectando
          // el movimiento con el último rumbo/velocidad conocidos.
          const overshoot = Math.min(elapsed - duration, DEAD_RECKONING_LIMIT_MS);
          heading = to.heading;
          speed = to.speed;
          if (speed > 0.3 && overshoot > 0) {
            const projected = destinationPoint(to.lat, to.lng, to.heading, speed * (overshoot / 1000));
            lat = projected.lat;
            lng = projected.lng;
          } else {
            lat = to.lat;
            lng = to.lng;
          }
        }

        stateRef.current = { lat, lng, heading, speed, hasFix: true };
        subscribersRef.current.forEach((cb) => cb(stateRef.current));

        if (now - lastSampleAtRef.current > SAMPLE_INTERVAL_MS) {
          lastSampleAtRef.current = now;
          setSampled({ lat, lng, heading, speed, hasFix: true });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const api = useMemo(
    () => ({
      subscribe(cb) {
        subscribersRef.current.add(cb);
        return () => subscribersRef.current.delete(cb);
      },
      getSnapshot: () => stateRef.current,
    }),
    []
  );

  return { sampled, ...api };
}
