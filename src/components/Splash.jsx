import styles from './Splash.module.css';

/** Splash con barrido de radar mientras se obtiene el primer fix de GPS. */
export function Splash({ error }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.radar}>
        <div className={styles.sweep} />
        <div className={styles.dot} />
      </div>
      <p className={styles.title}>Alerta Cámaras Paraná</p>
      <p className={styles.subtitle}>
        {error ?? 'Buscando tu ubicación GPS… activá el permiso de ubicación para empezar.'}
      </p>
    </div>
  );
}
