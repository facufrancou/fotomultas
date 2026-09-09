import styles from './AlertRing.module.css';

/**
 * Anillo de progreso circular (SVG stroke-dasharray). `progress` va de 0 (lejos)
 * a 1 (justo encima de la cámara) y se "cierra" a medida que baja la distancia.
 */
export function AlertRing({ progress = 0, size = 84, strokeWidth = 7, color, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashoffset = circumference * (1 - clamped);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        className={styles.svg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ '--stroke-width': strokeWidth }}
      >
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className={styles.progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
