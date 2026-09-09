import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

// leaflet-rotate viene compilado en formato UMD asumiendo que `L` ya existe
// como variable global (como si Leaflet se hubiera cargado con un <script>
// suelto). Con imports estáticos el orden real de evaluación entre paquetes
// pre-bundleados por Vite no queda garantizado, así que lo exponemos acá y
// recién después esperamos el import() dinámico del plugin (eso sí es
// estrictamente secuencial) antes de montar la app / crear el mapa.
window.L = L

await import('leaflet-rotate')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
