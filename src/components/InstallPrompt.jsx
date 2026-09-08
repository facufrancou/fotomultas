import { useEffect, useState } from 'react';
import { IconDownload } from './icons.jsx';
import styles from './InstallPrompt.module.css';

/** Botón de instalación PWA, aparece solo si el navegador dispara beforeinstallprompt. */
export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches ?? false
  );

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !deferredEvent) return null;

  const handleClick = async () => {
    deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  };

  return (
    <button type="button" className={styles.button} onClick={handleClick}>
      <span className={styles.icon}>
        <IconDownload />
      </span>
      Instalar app
    </button>
  );
}
