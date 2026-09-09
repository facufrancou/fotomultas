import { AlertRing } from './AlertRing.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { IconGear, IconLocate } from './icons.jsx';
import styles from './BottomSheet.module.css';

const LEVEL_LABEL = { far: 'A la vista', early: 'Acercándose', near: 'Cerca' };

function formatDistance(distance) {
  if (!Number.isFinite(distance)) return '—';
  if (distance >= 1000) return `${(distance / 1000).toFixed(1)} km`;
  return `${Math.round(distance)} m`;
}

/** HUD inferior: velocidad, próxima cámara y accesos a ajustes/tema/recentrado. */
export function BottomSheet({ speedKmh, nearest, earlyRadius, speedingAt, onOpenSettings, onRecenter }) {
  const hasAlert = nearest && Number.isFinite(nearest.distance) && nearest.distance <= earlyRadius;
  const progress = hasAlert ? 1 - nearest.distance / earlyRadius : 0;
  const levelColor = speedingAt ? 'var(--level-near)' : nearest ? `var(--level-${nearest.level})` : 'var(--accent)';

  return (
    <section className={styles.sheet} aria-label="Panel de estado">
      <div className={styles.grabber} />
      <div className={styles.row}>
        <AlertRing progress={hasAlert ? progress : 0} color={levelColor} size={78} strokeWidth={6}>
          {hasAlert ? (
            <div style={{ textAlign: 'center' }}>
              <div className={styles.ringDistance} style={{ '--level-color': levelColor }}>
                {formatDistance(nearest.distance)}
              </div>
              <div className={styles.ringUnit}>{LEVEL_LABEL[nearest.level]}</div>
            </div>
          ) : (
            <button
              type="button"
              className={styles.iconButton}
              style={{ border: 'none' }}
              onClick={onRecenter}
              aria-label="Centrar en mi posición"
              title="Centrar en mi posición"
            >
              <IconLocate />
            </button>
          )}
        </AlertRing>

        <div className={styles.stats}>
          <div className={styles.speed}>
            <span className={`${styles.speedValue}${speedingAt ? ` ${styles.speeding}` : ''}`}>
              {speedKmh ?? '--'}
            </span>
            <span className={styles.speedUnit}>km/h</span>
            {speedingAt && (
              <span className={styles.speedingTag}>Máx {speedingAt.speedLimit}</span>
            )}
          </div>
          {nearest ? (
            <div className={styles.nextCamera}>
              <span
                className={styles.badge}
                style={{ '--level-color': `var(--level-${nearest.level})` }}
              >
                {formatDistance(nearest.distance)}
              </span>
              <span className={styles.nextCameraAddress}>{nearest.direccion}</span>
            </div>
          ) : (
            <div className={styles.emptyState}>Sin cámaras cercanas</div>
          )}
          {hasAlert && nearest.medicion && (
            <div className={styles.medicion}>{nearest.medicion}</div>
          )}
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.iconButton}
            onClick={onOpenSettings}
            aria-label="Ajustes"
            title="Ajustes"
          >
            <IconGear />
          </button>
        </div>
      </div>

      <p className={styles.credit}>
        Creado y desarrollado por{' '}
        <a
          className={styles.krevik}
          href="https://krevik.ar"
          target="_blank"
          rel="noopener noreferrer"
        >
          KREVIK
        </a>
        {' · '}
        <a
          className={styles.donate}
          href="https://mpago.la/2y6THXZ"
          target="_blank"
          rel="noopener noreferrer"
        >
          Donar
        </a>
      </p>
    </section>
  );
}
