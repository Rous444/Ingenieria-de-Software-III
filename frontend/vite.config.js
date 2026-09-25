import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mismo motivo que en el backend: las fechas sin hora se leen en UTC. Los tests
// corren en la zona del contenedor, no en la de la máquina de quien los corre.
process.env.TZ = 'UTC';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo, quien traduce /api hacia el backend es este proxy.
    // Cuando la app corre en contenedor, Vite ya no está: ahí lo hace nginx
    // (frontend/nginx.conf, TP2). El código del front no cambia — siempre
    // llama a /api con ruta relativa, sin saber dónde vive el backend.
    proxy: { '/api': 'http://localhost:8080' },
  },
  // TP5: tests unitarios de la lógica del front (sin DOM) y su cobertura.
  test: {
    coverage: {
      provider: 'v8',
      // json-summary deja coverage-summary.json: lo lee el pipeline para el Summary.
      reporter: ['text', 'html', 'json-summary'],
      // QUÉ ENTRA EN LA CUENTA: los .js de src/, que es donde vive la lógica
      // (validación del formulario y cliente de la API). Un .js nuevo entra solo.
      // Quedan AFUERA los componentes .jsx (App, Ficha, FormAnimal) y main.jsx:
      // son pantalla y cableado de React, y se verifican de punta a punta en el TP7.
      include: ['src/**/*.js'],
      thresholds: { lines: 90, branches: 85 },
    },
  },
});
