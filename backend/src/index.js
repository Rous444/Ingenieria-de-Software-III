import * as Sentry from '@sentry/node';
import express from 'express';
import { init, pool } from './db.js';
import { animales } from './rutas/animales.js';

const app = express();
app.use(express.json());

// Endpoint de salud: es lo que mira el healthcheck del compose y lo primero que
// se consulta cuando algo "no anda" — si esto contesta, la API está viva.
//
// TP6: además dice QUÉ COMMIT está corriendo, y el smoke test del pipeline lo
// compara con el commit que acaba de verificar.
// TP7: el dato sale de la IMAGEN. GIT_SHA viene horneado en el Dockerfile (el
// pipeline lo pasa como build-arg), así que /health dice de qué commit es la
// imagen que el entorno está ejecutando. RENDER_GIT_COMMIT era el del TP6, cuando
// Render construía desde el repo; un servicio "Existing Image" no tiene repo, y
// queda sólo como respaldo.
const VERSION = process.env.GIT_SHA || process.env.RENDER_GIT_COMMIT || 'desconocida';

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', base: 'ok', version: VERSION });
  } catch {
    res.status(503).json({ status: 'degradado', base: 'sin conexión', version: VERSION });
  }
});

app.use('/api/animales', animales);

// TP9, TEMPORAL: un endpoint que falla a propósito, para ver un error llegar a
// Sentry desde producción. Se saca al cerrar el práctico.
app.get('/api/falla', () => {
  throw new Error('Falla de prueba del TP9');
});

// TP9: Sentry recibe cada error que llega hasta acá, antes que nuestro manejador.
Sentry.setupExpressErrorHandler(app);

// Cualquier error no capturado en una ruta termina acá, como JSON y no como un
// stack trace en el navegador.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = Number(process.env.PORT ?? 8080);

init()
  .then(() => {
    app.listen(PORT, () => console.log(`Libreta del Rodeo — API escuchando en el puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('No se pudo inicializar la base de datos:', err.message);
    process.exit(1);
  });
