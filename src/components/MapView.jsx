import { MapContainer, TileLayer } from 'react-leaflet';
import { VehicleMarker } from './VehicleMarker.jsx';
import { CameraMarker } from './CameraMarker.jsx';
import { MapAutoResize } from './MapAutoResize.jsx';
import styles from './MapView.module.css';

const PARANA_CENTER = [-31.7333, -60.5238];

/** Mapa a pantalla completa: tiles OSM, cámaras y el marcador imperativo del vehículo.
 * Modo "heading-up": el mapa rota para que arriba siempre sea el sentido de
 * circulación (VehicleMarker mueve la brújula vía map.setBearing()). */
export function MapView({ smooth, camerasWithDistance, vehicleId, registerRecenter, onFollowChange }) {
  return (
    <div className={styles.container}>
      <MapContainer
        center={PARANA_CENTER}
        zoom={14}
        zoomControl={false}
        rotate
        rotateControl={false}
        touchRotate={false}
        shiftKeyRotate={false}
        bearing={0}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        <MapAutoResize />
        {camerasWithDistance.map((camera) => (
          <CameraMarker key={camera.id} camera={camera} />
        ))}
        <VehicleMarker
          smooth={smooth}
          vehicleId={vehicleId}
          registerRecenter={registerRecenter}
          onFollowChange={onFollowChange}
        />
      </MapContainer>
    </div>
  );
}
