import { useSettings } from '../context/SettingsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { VehiclePicker } from './VehiclePicker.jsx';
import { IconClose, IconVolume, IconVolumeOff, IconVibrate } from './icons.jsx';
import styles from './SettingsPanel.module.css';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

function Switch({ on, onToggle, label }) {
  return (
    <button
      type="button"
      className={`${styles.switch} ${on ? styles.on : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}

/** Modal de ajustes: color de la flecha, alertas de voz/vibración y tema. */
export function SettingsPanel({ onClose }) {
  const { settings, dispatch } = useSettings();
  const { mode, setMode } = useTheme();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Ajustes">
        <div className={styles.header}>
          <h2 className={styles.title}>Ajustes</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Color</h3>
          <VehiclePicker
            selectedId={settings.vehicleId}
            onSelect={(vehicleId) => dispatch({ type: 'SET_VEHICLE', vehicleId })}
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Alertas</h3>
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>
              {settings.voiceEnabled ? <IconVolume /> : <IconVolumeOff />}
              Aviso de voz
            </span>
            <Switch
              on={settings.voiceEnabled}
              onToggle={() => dispatch({ type: 'TOGGLE_VOICE' })}
              label="Aviso de voz"
            />
          </div>
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>
              <IconVibrate />
              Vibración
            </span>
            <Switch
              on={settings.vibrationEnabled}
              onToggle={() => dispatch({ type: 'TOGGLE_VIBRATION' })}
              label="Vibración"
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Tema</h3>
          <div className={styles.themeOptions}>
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.themeChip} ${mode === opt.value ? styles.active : ''}`}
                onClick={() => setMode(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
