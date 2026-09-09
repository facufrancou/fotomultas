// Siluetas vista cenital (top-down), simples y originales (sin marcas/logos reales).
// Cada una apunta "hacia arriba" (norte, heading 0) por defecto para poder rotarlas
// directamente según el heading del vehículo. El cuerpo usa un gradiente basado en
// currentColor (claro arriba-izquierda, oscuro abajo-derecha) para dar look 3D/glossy
// sin dejar de ser recoloreable por CSS: cambiando `color` en el contenedor, todo el
// degradé se recalcula solo (currentColor se resuelve en cada <stop>).

const GLASS = 'var(--vehicle-glass)';

function bodyGradient(id) {
  return `
    <linearGradient id="${id}" x1="0.15" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="color-mix(in srgb, currentColor 45%, white 55%)"/>
      <stop offset="45%" stop-color="currentColor"/>
      <stop offset="100%" stop-color="color-mix(in srgb, currentColor 55%, black 45%)"/>
    </linearGradient>`;
}

function glassGradient(id) {
  return `
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="color-mix(in srgb, ${GLASS} 70%, white 30%)"/>
      <stop offset="100%" stop-color="color-mix(in srgb, ${GLASS} 80%, black 20%)"/>
    </linearGradient>`;
}

function shadowGradient(id) {
  return `
    <radialGradient id="${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="black" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </radialGradient>`;
}

function defs(prefix) {
  return `<defs>${bodyGradient(`${prefix}-body`)}${glassGradient(`${prefix}-glass`)}${shadowGradient(`${prefix}-shadow`)}</defs>`;
}

export const VEHICLES = [
  {
    id: 'classic',
    label: 'Clásico',
    accent: '#4c8dff',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        ${defs('classic')}
        <ellipse cx="50" cy="104" rx="42" ry="86" fill="url(#classic-shadow)"/>
        <rect x="22" y="18" width="56" height="164" rx="18" fill="url(#classic-body)"/>
        <rect x="22" y="18" width="56" height="164" rx="18" fill="none" stroke="black" stroke-opacity="0.18" stroke-width="1.5"/>
        <rect x="30" y="34" width="40" height="34" rx="8" fill="url(#classic-glass)"/>
        <rect x="30" y="132" width="40" height="30" rx="8" fill="url(#classic-glass)"/>
        <rect x="34" y="70" width="32" height="58" rx="6" fill="black" fill-opacity="0.08"/>
        <rect x="14" y="46" width="10" height="26" rx="4" fill="url(#classic-body)"/>
        <rect x="76" y="46" width="10" height="26" rx="4" fill="url(#classic-body)"/>
        <rect x="14" y="128" width="10" height="26" rx="4" fill="url(#classic-body)"/>
        <rect x="76" y="128" width="10" height="26" rx="4" fill="url(#classic-body)"/>
        <rect x="38" y="21" width="24" height="5" rx="2.5" fill="white" fill-opacity="0.55"/>
      </svg>`,
  },
  {
    id: 'sports',
    label: 'Deportivo',
    accent: '#ff4c6a',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        ${defs('sports')}
        <ellipse cx="50" cy="104" rx="42" ry="90" fill="url(#sports-shadow)"/>
        <path d="M50 12 C74 12 84 40 84 76 L84 150 C84 172 68 188 50 188 C32 188 16 172 16 150 L16 76 C16 40 26 12 50 12 Z" fill="url(#sports-body)"/>
        <path d="M50 12 C74 12 84 40 84 76 L84 150 C84 172 68 188 50 188 C32 188 16 172 16 150 L16 76 C16 40 26 12 50 12 Z" fill="none" stroke="black" stroke-opacity="0.2" stroke-width="1.5"/>
        <path d="M50 30 C62 30 68 46 68 62 L32 62 C32 46 38 30 50 30 Z" fill="url(#sports-glass)"/>
        <rect x="34" y="120" width="32" height="26" rx="7" fill="url(#sports-glass)"/>
        <path d="M50 66 C60 66 64 78 64 96 L36 96 C36 78 40 66 50 66 Z" fill="black" fill-opacity="0.1"/>
        <rect x="10" y="58" width="9" height="30" rx="4" fill="url(#sports-body)"/>
        <rect x="81" y="58" width="9" height="30" rx="4" fill="url(#sports-body)"/>
        <rect x="10" y="140" width="9" height="26" rx="4" fill="url(#sports-body)"/>
        <rect x="81" y="140" width="9" height="26" rx="4" fill="url(#sports-body)"/>
        <rect x="38" y="182" width="24" height="8" rx="3" fill="black" fill-opacity="0.55"/>
        <path d="M40 16 C44 14 56 14 60 16" stroke="white" stroke-opacity="0.6" stroke-width="4" stroke-linecap="round" fill="none"/>
      </svg>`,
  },
  {
    id: 'pickup',
    label: 'Pickup',
    accent: '#ffa64c',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        ${defs('pickup')}
        <ellipse cx="50" cy="104" rx="44" ry="90" fill="url(#pickup-shadow)"/>
        <rect x="20" y="14" width="60" height="82" rx="12" fill="url(#pickup-body)"/>
        <rect x="20" y="14" width="60" height="82" rx="12" fill="none" stroke="black" stroke-opacity="0.18" stroke-width="1.5"/>
        <rect x="30" y="26" width="40" height="34" rx="7" fill="url(#pickup-glass)"/>
        <rect x="20" y="100" width="60" height="86" rx="8" fill="url(#pickup-body)" opacity="0.96"/>
        <rect x="20" y="100" width="60" height="86" rx="8" fill="none" stroke="black" stroke-opacity="0.18" stroke-width="1.5"/>
        <rect x="27" y="108" width="46" height="70" rx="5" fill="none" stroke="black" stroke-opacity="0.25" stroke-width="3"/>
        <rect x="27" y="108" width="46" height="70" rx="5" fill="white" fill-opacity="0.05"/>
        <rect x="12" y="44" width="10" height="28" rx="4" fill="url(#pickup-body)"/>
        <rect x="78" y="44" width="10" height="28" rx="4" fill="url(#pickup-body)"/>
        <rect x="12" y="140" width="10" height="30" rx="4" fill="url(#pickup-body)"/>
        <rect x="78" y="140" width="10" height="30" rx="4" fill="url(#pickup-body)"/>
        <rect x="36" y="17" width="28" height="5" rx="2.5" fill="white" fill-opacity="0.55"/>
      </svg>`,
  },
  {
    id: 'hatchback',
    label: 'Hatchback',
    accent: '#4cffb0',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        ${defs('hatchback')}
        <ellipse cx="50" cy="104" rx="42" ry="88" fill="url(#hatchback-shadow)"/>
        <rect x="20" y="24" width="60" height="152" rx="22" fill="url(#hatchback-body)"/>
        <rect x="20" y="24" width="60" height="152" rx="22" fill="none" stroke="black" stroke-opacity="0.18" stroke-width="1.5"/>
        <rect x="29" y="38" width="42" height="30" rx="8" fill="url(#hatchback-glass)"/>
        <rect x="29" y="132" width="42" height="28" rx="8" fill="url(#hatchback-glass)"/>
        <rect x="33" y="72" width="34" height="56" rx="6" fill="black" fill-opacity="0.08"/>
        <rect x="12" y="50" width="10" height="24" rx="4" fill="url(#hatchback-body)"/>
        <rect x="78" y="50" width="10" height="24" rx="4" fill="url(#hatchback-body)"/>
        <rect x="12" y="126" width="10" height="24" rx="4" fill="url(#hatchback-body)"/>
        <rect x="78" y="126" width="10" height="24" rx="4" fill="url(#hatchback-body)"/>
        <rect x="36" y="27" width="28" height="5" rx="2.5" fill="white" fill-opacity="0.55"/>
      </svg>`,
  },
  {
    id: 'moto',
    label: 'Moto',
    accent: '#c04cff',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        ${defs('moto')}
        <ellipse cx="50" cy="104" rx="30" ry="92" fill="url(#moto-shadow)"/>
        <ellipse cx="50" cy="46" rx="10" ry="26" fill="url(#moto-body)"/>
        <rect x="44" y="70" width="12" height="70" rx="6" fill="url(#moto-body)"/>
        <ellipse cx="50" cy="150" rx="14" ry="30" fill="url(#moto-body)" opacity="0.96"/>
        <rect x="46" y="30" width="8" height="20" rx="3" fill="url(#moto-glass)"/>
        <rect x="18" y="36" width="30" height="7" rx="3.5" fill="url(#moto-body)"/>
        <rect x="52" y="36" width="30" height="7" rx="3.5" fill="url(#moto-body)"/>
        <circle cx="50" cy="18" r="10" fill="url(#moto-body)"/>
        <circle cx="50" cy="184" r="12" fill="url(#moto-body)"/>
        <circle cx="46" cy="14" r="3" fill="white" fill-opacity="0.6"/>
      </svg>`,
  },
];

export function getVehicleById(id) {
  return VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];
}
