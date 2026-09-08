import { useState } from 'react';
import { VEHICLES } from '../assets/vehicles/vehicleShapes.js';
import styles from './VehiclePicker.module.css';

/** Grilla de selección de vehículo: al tocar un modelo, gira levemente
 * (mostrando que rota con el heading) y queda seleccionado. */
export function VehiclePicker({ selectedId, onSelect }) {
  const [spinningId, setSpinningId] = useState(null);

  const handlePick = (id) => {
    onSelect(id);
    setSpinningId(id);
    window.setTimeout(() => setSpinningId((current) => (current === id ? null : current)), 720);
  };

  return (
    <div className={styles.grid} role="listbox" aria-label="Elegir vehículo">
      {VEHICLES.map((vehicle) => (
        <button
          key={vehicle.id}
          type="button"
          role="option"
          aria-selected={selectedId === vehicle.id}
          className={`${styles.card} ${selectedId === vehicle.id ? styles.selected : ''}`}
          onClick={() => handlePick(vehicle.id)}
        >
          <span
            className={`${styles.iconWrap} ${spinningId === vehicle.id ? styles.spin : ''}`}
            style={{ color: vehicle.accent }}
            dangerouslySetInnerHTML={{ __html: vehicle.svg }}
          />
          <span className={styles.label}>{vehicle.label}</span>
        </button>
      ))}
    </div>
  );
}
