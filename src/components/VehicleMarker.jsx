import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getVehicleById } from '../assets/vehicles/vehicleShapes.js';
import styles from './VehicleMarker.module.css';

// Con el vehículo en movimiento seguimos el mapa a este ritmo (no en cada uno
// de los 60fps del marcador): suficientemente seguido para sentirse "pegado"
// a la navegación, sin recalcular tiles/paneo de Leaflet en cada frame.
const FOLLOW_INTERVAL_MS = 500;
const MOVING_SPEED_MPS = 0.6; // ~2.2 km/h: por debajo de esto se considera detenido

// El ícono se dibujó pensando en zoom 17. Los tiles raster de OSM duplican su
// tamaño en pantalla por cada nivel de zoom, así que al acercar acompañamos esa
// misma potencia de 2 (para no quedar chico/gigante respecto a la calle). Al
// alejar NO lo achicamos al mismo ritmo: en vez de volverse un punto invisible,
// crece levemente para seguir siendo un "estás acá" legible.
const REFERENCE_ZOOM = 17;
const MAX_SCALE_IN = 1.8;
const MAX_SCALE_OUT = 1.7;
const GROW_PER_ZOOM_OUT = 0.16;

function zoomScale(zoom) {
  if (zoom >= REFERENCE_ZOOM) {
    return Math.min(MAX_SCALE_IN, 2 ** (zoom - REFERENCE_ZOOM));
  }
  return Math.min(MAX_SCALE_OUT, 1 + (REFERENCE_ZOOM - zoom) * GROW_PER_ZOOM_OUT);
}

function buildIcon(vehicleId) {
  const vehicle = getVehicleById(vehicleId);
  const html = `
    <div class="${styles.outer}">
      <div class="${styles.rotor}" style="color:${vehicle.accent}">${vehicle.svg}</div>
    </div>`;
  return L.divIcon({
    html,
    className: '', // sin clases default de Leaflet que agreguen fondo/borde
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

/**
 * Marcador del vehículo, 100% imperativo: nunca pasa por setState de React.
 * Se mueve en cada frame del rAF de useSmoothPosition directamente sobre la
 * instancia de Leaflet (marker.setLatLng + rotate en el div interno), así el
 * framerate del movimiento no depende de la reconciliación de React.
 */
export function VehicleMarker({ smooth, vehicleId, registerRecenter, onFollowChange }) {
  const map = useMap();
  const markerRef = useRef(null);
  const rotorRef = useRef(null);
  const followRef = useRef(true);
  const lastPanAtRef = useRef(0);
  const centeredOnceRef = useRef(false);

  useEffect(() => {
    const marker = L.marker([0, 0], {
      icon: buildIcon(vehicleId),
      zIndexOffset: 1000,
      interactive: false,
      keyboard: false,
    }).addTo(map);
    markerRef.current = marker;
    rotorRef.current = marker.getElement()?.querySelector(`.${styles.rotor}`);
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setIcon(buildIcon(vehicleId));
    rotorRef.current = markerRef.current.getElement()?.querySelector(`.${styles.rotor}`);
  }, [vehicleId]);

  useEffect(() => {
    // Solo un arrastre real del usuario saca del modo seguimiento: los paneos
    // programáticos (el propio auto-seguimiento, el popup de una cámara) no
    // disparan 'dragstart'.
    const onDragStart = () => {
      followRef.current = false;
      onFollowChange?.(false);
    };
    map.on('dragstart', onDragStart);
    return () => map.off('dragstart', onDragStart);
  }, [map, onFollowChange]);

  useEffect(() => {
    if (!registerRecenter) return undefined;
    registerRecenter(() => {
      followRef.current = true;
      onFollowChange?.(true);
      const snap = smooth.getSnapshot();
      if (snap.lat != null) {
        map.flyTo([snap.lat, snap.lng], Math.max(map.getZoom(), 17), { duration: 0.6 });
      }
    });
    return () => registerRecenter(null);
  }, [registerRecenter, smooth, map, onFollowChange]);

  useEffect(() => {
    const unsubscribe = smooth.subscribe((state) => {
      const marker = markerRef.current;
      if (!marker || state.lat == null) return;

      marker.setLatLng([state.lat, state.lng]);
      if (rotorRef.current) {
        const scale = zoomScale(map.getZoom());
        rotorRef.current.style.transform = `rotate(${state.heading}deg) scale(${scale})`;
      }

      if (!centeredOnceRef.current) {
        centeredOnceRef.current = true;
        map.setView([state.lat, state.lng], 17, { animate: false });
        return;
      }

      if (!followRef.current) return;

      // En modo seguimiento, con el vehículo en movimiento, el mapa se corre
      // con él (como en Waze/Google Maps) en vez de esperar a que llegue al
      // borde. Detenido, no forzamos nada para no pelear con el usuario si
      // quiere mirar los alrededores.
      if (state.speed < MOVING_SPEED_MPS) return;

      const now = performance.now();
      if (now - lastPanAtRef.current < FOLLOW_INTERVAL_MS) return;
      lastPanAtRef.current = now;
      map.panTo([state.lat, state.lng], {
        animate: true,
        duration: FOLLOW_INTERVAL_MS / 1000,
        easeLinearity: 1,
      });
    });
    return unsubscribe;
  }, [smooth, map]);

  return null;
}
