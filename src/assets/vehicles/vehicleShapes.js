// Siluetas vista cenital (top-down), simples y originales (sin marcas/logos reales).
// Cada una apunta "hacia arriba" (norte, heading 0) por defecto para poder rotarlas
// directamente según el heading del vehículo. El color del cuerpo usa currentColor,
// así se recolorea solo cambiando la propiedad CSS `color` del contenedor (tema/paleta).

const GLASS = 'var(--vehicle-glass)';

export const VEHICLES = [
  {
    id: 'classic',
    label: 'Clásico',
    accent: '#4c8dff',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="18" width="56" height="164" rx="18" fill="currentColor"/>
        <rect x="30" y="34" width="40" height="34" rx="8" fill="${GLASS}"/>
        <rect x="30" y="132" width="40" height="30" rx="8" fill="${GLASS}"/>
        <rect x="14" y="46" width="10" height="26" rx="4" fill="currentColor"/>
        <rect x="76" y="46" width="10" height="26" rx="4" fill="currentColor"/>
        <rect x="14" y="128" width="10" height="26" rx="4" fill="currentColor"/>
        <rect x="76" y="128" width="10" height="26" rx="4" fill="currentColor"/>
      </svg>`,
  },
  {
    id: 'sports',
    label: 'Deportivo',
    accent: '#ff4c6a',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 12 C74 12 84 40 84 76 L84 150 C84 172 68 188 50 188 C32 188 16 172 16 150 L16 76 C16 40 26 12 50 12 Z" fill="currentColor"/>
        <path d="M50 30 C62 30 68 46 68 62 L32 62 C32 46 38 30 50 30 Z" fill="${GLASS}"/>
        <rect x="34" y="120" width="32" height="26" rx="7" fill="${GLASS}"/>
        <rect x="10" y="58" width="9" height="30" rx="4" fill="currentColor"/>
        <rect x="81" y="58" width="9" height="30" rx="4" fill="currentColor"/>
        <rect x="10" y="140" width="9" height="26" rx="4" fill="currentColor"/>
        <rect x="81" y="140" width="9" height="26" rx="4" fill="currentColor"/>
        <rect x="38" y="182" width="24" height="8" rx="3" fill="currentColor" opacity="0.8"/>
      </svg>`,
  },
  {
    id: 'pickup',
    label: 'Pickup',
    accent: '#ffa64c',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="14" width="60" height="82" rx="12" fill="currentColor"/>
        <rect x="30" y="26" width="40" height="34" rx="7" fill="${GLASS}"/>
        <rect x="20" y="100" width="60" height="86" rx="8" fill="currentColor" opacity="0.92"/>
        <rect x="27" y="108" width="46" height="70" rx="5" fill="none" stroke="${GLASS}" stroke-width="3"/>
        <rect x="12" y="44" width="10" height="28" rx="4" fill="currentColor"/>
        <rect x="78" y="44" width="10" height="28" rx="4" fill="currentColor"/>
        <rect x="12" y="140" width="10" height="30" rx="4" fill="currentColor"/>
        <rect x="78" y="140" width="10" height="30" rx="4" fill="currentColor"/>
      </svg>`,
  },
  {
    id: 'hatchback',
    label: 'Hatchback',
    accent: '#4cffb0',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="24" width="60" height="152" rx="22" fill="currentColor"/>
        <rect x="29" y="38" width="42" height="30" rx="8" fill="${GLASS}"/>
        <rect x="29" y="132" width="42" height="28" rx="8" fill="${GLASS}"/>
        <rect x="12" y="50" width="10" height="24" rx="4" fill="currentColor"/>
        <rect x="78" y="50" width="10" height="24" rx="4" fill="currentColor"/>
        <rect x="12" y="126" width="10" height="24" rx="4" fill="currentColor"/>
        <rect x="78" y="126" width="10" height="24" rx="4" fill="currentColor"/>
      </svg>`,
  },
  {
    id: 'moto',
    label: 'Moto',
    accent: '#c04cff',
    svg: `
      <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="46" rx="10" ry="26" fill="currentColor"/>
        <rect x="44" y="70" width="12" height="70" rx="6" fill="currentColor"/>
        <ellipse cx="50" cy="150" rx="14" ry="30" fill="currentColor" opacity="0.92"/>
        <rect x="46" y="30" width="8" height="20" rx="3" fill="${GLASS}"/>
        <rect x="18" y="36" width="30" height="7" rx="3.5" fill="currentColor"/>
        <rect x="52" y="36" width="30" height="7" rx="3.5" fill="currentColor"/>
        <circle cx="50" cy="18" r="10" fill="currentColor"/>
        <circle cx="50" cy="184" r="12" fill="currentColor"/>
      </svg>`,
  },
];

export function getVehicleById(id) {
  return VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];
}
