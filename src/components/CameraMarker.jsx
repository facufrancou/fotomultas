import { useMemo, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import styles from './CameraMarker.module.css';

const BREATHE_DURATION = { far: '2.6s', early: '1.6s', near: '0.9s' };

function buildIcon(level, confiable) {
  const rings =
    level !== 'far'
      ? `<span class="${styles.ring}"></span><span class="${styles.ring}"></span><span class="${styles.ring}"></span>`
      : '';
  const html = `
    <div class="${styles.wrap}" style="--dot-color:var(--level-${level});--breathe-duration:${BREATHE_DURATION[level]}">
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
export function CameraMarker({ camera }) {
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
      <Popup>
        <strong>{camera.direccion}</strong>
        <br />
        {distanceLabel ? `A ${distanceLabel}` : 'Calculando distancia…'}
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
