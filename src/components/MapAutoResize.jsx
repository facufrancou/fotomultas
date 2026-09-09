import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Leaflet mide el contenedor una sola vez al montar. Si en la primera carga
 * el layout todavía se está acomodando (100dvh/safe-area asentándose, la
 * barra del navegador mostrándose/ocultándose, fuentes cargando), el mapa
 * queda con el tile-grid calculado para un contenedor "a medio tamaño" hasta
 * que algo lo obliga a remedir — de ahí el bug de "entro y se ve a la mitad,
 * salgo y vuelvo a entrar y se arregla". Un ResizeObserver sobre el propio
 * contenedor + los eventos de resize/orientación resuelven esto sin recargar.
 */
export function MapAutoResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const invalidate = () => map.invalidateSize();

    // Primer frame ya renderizado + un pequeño margen para layouts que
    // todavía se están acomodando (dvh, safe-area, fuentes).
    const raf = requestAnimationFrame(invalidate);
    const timeout = window.setTimeout(invalidate, 300);

    const resizeObserver = new ResizeObserver(() => invalidate());
    resizeObserver.observe(container);

    window.addEventListener('resize', invalidate);
    window.addEventListener('orientationchange', invalidate);
    document.addEventListener('visibilitychange', invalidate);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('orientationchange', invalidate);
      document.removeEventListener('visibilitychange', invalidate);
    };
  }, [map]);

  return null;
}
