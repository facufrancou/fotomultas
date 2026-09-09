import { memo, useMemo, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import styles from './CameraMarker.module.css';

const BREATHE_MS = { far: 2600, early: 1600, near: 900 };

function buildIcon(level, confiable) {
  const rings =
    level !== 'far'
      ? `<span class="${styles.ring}"></span><span class="${styles.ring}"></span><span class="${styles.ring}"></span>`
      : '';
  const durationMs = BREATHE_MS[level];
  // Delay negativo = -(reloj actual módulo duración): así todos los marcadores
  // con el mismo nivel (misma duración) quedan en fase entre sí sin importar
  // en qué momento se montó cada uno, en vez de arrancar cada animación desde
  // cero al crearse el <div>.
  const delayMs = -(Date.now() % durationMs);
  const html = `
    <div class="${styles.wrap}" style="--dot-color:var(--level-${level});--breathe-duration:${durationMs}ms;--breathe-delay:${delayMs}ms">
      ${rings}
      <span class="${styles.dot}${confiable ? '' : ` ${styles.unreliable}`}"></span>
    </div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function formatDistance(distance) {
  if (!Number.isFinite(distance)) return null;
  if (distance >= 1000) return `${(distance / 1000).toFixed(1)} km`;
  return `${Math.round(distance)} m`;
}

/** Marcador de cámara: respira más rápido y cambia de color a medida que se acerca. */
function CameraMarkerImpl({ camera }) {
  const markerRef = useRef(null);
  const icon = useMemo(() => buildIcon(camera.level, camera.confiable), [camera.level, camera.confiable]);
  const distanceLabel = formatDistance(camera.distance);

  const handleClick = () => {
    const el = markerRef.current?.getElement()?.querySelector(`.${styles.dot}`);
    if (el) {
      el.classList.remove(styles.bump);
      // reflow para poder reiniciar la animación en clicks consecutivos
      void el.offsetWidth;
      el.classList.add(styles.bump);
    }
    if (navigator.vibrate) navigator.vibrate(15);
  };

  return (
    <Marker
      ref={markerRef}
      position={[camera.lat, camera.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      {/* autoPan desactivado: si no, cada vez que la distancia se actualiza (varias
          veces por segundo mientras hay GPS activo) Leaflet repanea el mapa solo
          para "mantener visible" el popup, peleando con el gesto del usuario. */}
      <Popup autoPan={false}>
        <strong>{camera.direccion}</strong>
        <br />
        {distanceLabel ? `A ${distanceLabel}` : 'Calculando distancia…'}
        {camera.medicion && (
          <>
            <br />
            {camera.medicion}
          </>
        )}
        {!camera.confiable && (
          <>
            <br />
            <em>Ubicación no confirmada</em>
          </>
        )}
      </Popup>
    </Marker>
  );
}

function sameCamera(prev, next) {
  const a = prev.camera;
  const b = next.camera;
  if (a.id !== b.id || a.level !== b.level || a.confiable !== b.confiable || a.direccion !== b.direccion) {
    return false;
  }
  // Redondeamos a 10m: evita re-renderizar (y re-disparar el popup) en cada
  // muestra de posición cuando el número mostrado ni siquiera va a cambiar.
  const round = (d) => (Number.isFinite(d) ? Math.round(d / 10) : -1);
  return round(a.distance) === round(b.distance);
}

export const CameraMarker = memo(CameraMarkerImpl, sameCamera);
