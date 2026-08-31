import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
});
