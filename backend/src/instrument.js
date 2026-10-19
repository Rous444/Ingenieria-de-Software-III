// TP9: Sentry, cargado ANTES que la app (node --import ./src/instrument.js …).
// Tiene que arrancar primero para poder medir Express y pg desde adentro: así
// cada pedido queda con su tiempo, y cada consulta a la base también.
//
// El DSN NO está en el código: entra por SENTRY_DSN, y sólo está cargado en el
// servicio de PRODUCCIÓN de Render. Sin la variable (tu máquina, los tests, QA,
// preprod) Sentry queda apagado y la api anda igual.
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'production',
  // El commit horneado en la imagen (TP7): cada error queda atado a la versión que lo tuvo.
  release: process.env.GIT_SHA || undefined,
  tracesSampleRate: 1.0, // medir todos los pedidos: con este tráfico sobra cuota
});
