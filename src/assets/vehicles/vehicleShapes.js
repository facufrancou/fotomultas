// Indicador de posición: una flecha de navegación (chevron redondeado), no un
// vehículo dibujado. Apunta "hacia arriba" (norte, heading 0) por defecto para
// poder rotarla directamente según el heading. Un solo shape, varias paletas:
// el cuerpo usa un gradiente basado en currentColor (glossy, claro arriba /
// oscuro abajo) para dar sensación de volumen sin dejar de ser recoloreable.

function arrowSvg(prefix) {
  return `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${prefix}-glow" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="${prefix}-body" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="color-mix(in srgb, currentColor 40%, white 60%)"/>
          <stop offset="50%" stop-color="currentColor"/>
          <stop offset="100%" stop-color="color-mix(in srgb, currentColor 55%, black 45%)"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="34" r="30" fill="url(#${prefix}-glow)"/>
      <path
        d="M32 5.5c1.7 0 3.2 1 3.9 2.6l14.6 39.1c1 2.7-1.7 5.2-4.3 3.9l-13-6.5a4.4 4.4 0 0 0-3.9 0l-13 6.5c-2.6 1.3-5.3-1.2-4.3-3.9L26.6 8.1a4.2 4.2 0 0 1 3.9-2.6h1.5Z"
        fill="url(#${prefix}-body)"
        stroke="white"
        stroke-opacity="0.85"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <path d="M32 13 22 39" stroke="white" stroke-opacity="0.35" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
}

export const VEHICLES = [
  { id: 'cyan', label: 'Celeste', accent: '#22d3ee', svg: arrowSvg('cyan') },
  { id: 'red', label: 'Rojo', accent: '#ff4c6a', svg: arrowSvg('red') },
  { id: 'orange', label: 'Naranja', accent: '#ffa64c', svg: arrowSvg('orange') },
  { id: 'green', label: 'Verde', accent: '#4cffb0', svg: arrowSvg('green') },
  { id: 'purple', label: 'Violeta', accent: '#c04cff', svg: arrowSvg('purple') },
];

export function getVehicleById(id) {
  return VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];
}
