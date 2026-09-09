import { useEffect, useRef } from 'react';

/**
 * Mantiene la pantalla encendida mientras la app está en primer plano, vía la
 * Screen Wake Lock API (Chrome/Android y Safari 16.4+/iOS). El sistema libera
 * el wake lock automáticamente al pasar la pestaña a segundo plano, así que
 * lo volvemos a pedir cuando la app vuelve a estar visible.
 */
export function useWakeLock(enabled = true) {
  const lockRef = useRef(null);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return undefined;

    let cancelled = false;

    const requestLock = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          lock.release();
          return;
        }
        lockRef.current = lock;
        lock.addEventListener('release', () => {
          if (lockRef.current === lock) lockRef.current = null;
        });
      } catch {
        // el navegador puede rechazar el pedido (batería baja, permisos, etc.)
        // no bloqueamos el resto de la app por esto.
      }
    };

    requestLock();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !lockRef.current) {
        requestLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      lockRef.current?.release();
      lockRef.current = null;
    };
  }, [enabled]);
}
