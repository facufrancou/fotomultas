import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getVehicleById } from '../assets/vehicles/vehicleShapes.js';
import styles from './VehicleMarker.module.css';

const RECENTER_INTERVAL_MS = 1500; // el paneo del mapa va más espaciado que el marcador (60fps)

// El ícono se dibujó pensando en zoom 17 (nivel al que centramos al arrancar).
// Los tiles raster de OSM duplican su tamaño en pantalla por cada nivel de zoom,
// así que escalamos el auto con esa misma potencia de 2 para que "acompañe" a las
// calles en vez de quedar con un tamaño fijo (chico/gigante/deforme según el zoom).
const REFERENCE_ZOOM = 17;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.85;

function zoomScale(zoom) {
  const raw = 2 ** (zoom - REFERENCE_ZOOM);
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, raw));
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
    iconSize: [42, 68],
    iconAnchor: [21, 34],
  });
}

/**
 * Marcador del vehículo, 100% imperativo: nunca pasa por setState de React.
 * Se mueve en cada frame del rAF de useSmoothPosition directamente sobre la
 * instancia de Leaflet (marker.setLatLng + rotate en el div interno), así el
 * framerate del movimiento no depende de la reconciliación de React.
 */
export function VehicleMarker({ smooth, vehicleId, registerRecenter }) {
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
    const onDragStart = () => {
      followRef.current = false;
    };
    map.on('dragstart', onDragStart);
    return () => map.off('dragstart', onDragStart);
  }, [map]);

  useEffect(() => {
    if (!registerRecenter) return undefined;
    registerRecenter(() => {
      followRef.current = true;
      const snap = smooth.getSnapshot();
      if (snap.lat != null) {
        map.flyTo([snap.lat, snap.lng], Math.max(map.getZoom(), 17), { duration: 0.6 });
      }
    });
    return () => registerRecenter(null);
  }, [registerRecenter, smooth, map]);

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
      const now = performance.now();
      if (now - lastPanAtRef.current < RECENTER_INTERVAL_MS) return;

      // Solo repanea si el vehículo se acercó al borde del viewport, para no
      // pelear con el gesto del usuario ni generar jank moviendo la cámara sin parar.
      const point = map.latLngToContainerPoint([state.lat, state.lng]);
      const size = map.getSize();
      const margin = Math.min(size.x, size.y) * 0.28;
      const nearEdge =
        point.x < margin || point.x > size.x - margin || point.y < margin || point.y > size.y - margin;

      if (nearEdge) {
        lastPanAtRef.current = now;
        map.panTo([state.lat, state.lng], { animate: true, duration: 0.8, easeLinearity: 0.4 });
      }
    });
    return unsubscribe;
  }, [smooth, map]);

  return null;
}
