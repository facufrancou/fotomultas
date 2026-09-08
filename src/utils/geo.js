// Utilidades geográficas: distancia Haversine, rumbo entre coordenadas
// e interpolación angular por el camino más corto.

const EARTH_RADIUS_M = 6371000;

export function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

/** Distancia en metros entre dos coordenadas (fórmula Haversine). */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/** Rumbo (0-360, 0 = norte) desde un punto a otro. Sirve como fallback cuando
 * no hay sensor de orientación: se calcula entre dos fixes GPS consecutivos. */
export function bearingBetween(lat1, lng1, lat2, lng2) {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

/** Diferencia angular más corta entre dos rumbos, en (-180, 180]. */
export function shortestAngleDiff(from, to) {
  let diff = (to - from) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

/** Interpola entre dos rumbos por el camino más corto (nunca "para el lado largo"). */
export function lerpAngle(from, to, t) {
  const diff = shortestAngleDiff(from, to);
  return (from + diff * t + 360) % 360;
}

/** Interpolación lineal simple. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Destino a partir de un punto, rumbo (grados) y distancia (metros). */
export function destinationPoint(lat, lng, bearingDeg, distanceM) {
  const delta = distanceM / EARTH_RADIUS_M;
  const theta = toRad(bearingDeg);
  const phi1 = toRad(lat);
  const lambda1 = toRad(lng);

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
      Math.cos(phi1) * Math.sin(delta) * Math.cos(theta)
  );
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
    );

  return { lat: toDeg(phi2), lng: ((toDeg(lambda2) + 540) % 360) - 180 };
}
