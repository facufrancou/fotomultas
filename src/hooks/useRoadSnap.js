import { useEffect, useRef, useState } from 'react';

// Servicio público de OSRM (gratuito, sin API key). Es una demo pública: no
// tiene garantía de uptime ni límites de uso pensados para producción a
// escala, pero alcanza perfectamente para uso personal/testing de esta app.
const OSRM_NEAREST_URL = 'https://router.project-osrm.org/nearest/v1/driving';

// Si la calle mapeada más cercana está más lejos que esto, no forzamos el
// snap (puede ser un estacionamiento, un camino sin mapear, o simplemente el
// GPS con mucho error) y usamos el fix crudo tal cual.
const MAX_SNAP_DISTANCE_M = 35;

// No saturamos el servicio público: como mucho una consulta cada tanto,
// aunque lleguen fixes del GPS más seguido.
const MIN_QUERY_INTERVAL_MS = 900;
const FETCH_TIMEOUT_MS = 4000;

/**
 * Ajusta ("snap") cada fix crudo del GPS al punto más cercano de la red vial
 * real usando OSRM, para evitar el zigzag/"ida y vuelta" típico del ruido del
 * GPS cuando en realidad el vehículo se mueve en línea recta por una calle.
 * Si la consulta falla, tarda demasiado, o no hay una calle mapeada cerca,
 * cae de vuelta al fix crudo sin bloquear el resto del pipeline.
 */
export function useRoadSnap(rawFix) {
  const [snappedFix, setSnappedFix] = useState(null);
  const lastQueryAtRef = useRef(0);
  const controllerRef = useRef(null);
  const prevResultRef = useRef(null);

  useEffect(() => {
    if (!rawFix) return undefined;

    const now = performance.now();
    const dueForQuery = now - lastQueryAtRef.current >= MIN_QUERY_INTERVAL_MS;

    if (!dueForQuery) {
      // Muy seguido para el servicio público: reusamos el fix crudo esta vez.
      const fallback = { ...rawFix, prevFix: prevResultRef.current };
      prevResultRef.current = fallback;
      setSnappedFix(fallback);
      return undefined;
    }

    lastQueryAtRef.current = now;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const url = `${OSRM_NEAREST_URL}/${rawFix.lng},${rawFix.lat}?number=1`;

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const waypoint = data?.waypoints?.[0];
        const canSnap = waypoint && waypoint.distance <= MAX_SNAP_DISTANCE_M;
        const result = canSnap
          ? { ...rawFix, lat: waypoint.location[1], lng: waypoint.location[0], prevFix: prevResultRef.current }
          : { ...rawFix, prevFix: prevResultRef.current };
        prevResultRef.current = result;
        setSnappedFix(result);
      })
      .catch(() => {
        const fallback = { ...rawFix, prevFix: prevResultRef.current };
        prevResultRef.current = fallback;
        setSnappedFix(fallback);
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [rawFix]);

  return snappedFix;
}
