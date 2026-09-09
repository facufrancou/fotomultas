import { IconLocate } from './icons.jsx';
import styles from './RecenterButton.module.css';

/** Aparece cuando el usuario mueve el mapa a mano mientras navega; lo devuelve
 * al modo seguimiento (mapa centrado y pegado a la posición del vehículo). */
export function RecenterButton({ onClick }) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <span className={styles.icon}>
        <IconLocate />
      </span>
      Volver a centrar
    </button>
  );
}
