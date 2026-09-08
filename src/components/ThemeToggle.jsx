import { useTheme } from '../context/ThemeContext.jsx';
import { IconSun, IconMoon } from './icons.jsx';
import styles from './ThemeToggle.module.css';

export function ThemeToggle({ className = '' }) {
  const { resolved, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={toggleTheme}
      aria-label={resolved === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={resolved === 'dark' ? 'Tema claro' : 'Tema oscuro'}
    >
      {resolved === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  );
}
