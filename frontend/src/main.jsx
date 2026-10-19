import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './estilos.css';

// TP9: Sentry en el navegador: errores de la pantalla, cuánto tarda en cargar
// y qué se visita. El DSN del front SÍ va escrito acá, y no es un descuido: sólo
// sirve para ENVIAR datos a mi proyecto (no para leerlos), y viaja igual en el
// JavaScript que baja cualquier navegador. No es un secreto como una API key.
Sentry.init({
  dsn: 'https://0ffa3608552813ec87e5934db3244a08@o4512283428519936.ingest.us.sentry.io/4512283505131520',
  environment: window.location.hostname, // de qué sitio vino: QA, PROD, preprod o localhost
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
