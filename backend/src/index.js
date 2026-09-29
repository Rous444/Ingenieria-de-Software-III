import express from 'express';
import { init, pool } from './db.js';
import { animales } from './rutas/animales.js';

const app = express();
app.use(express.json());

// Endpoint de salud: es lo que mira el healthcheck del compose y lo primero que
// se consulta cuando algo "no anda" — si esto contesta, la API está viva.
//
// TP6: además dice QUÉ COMMIT está corriendo. Render define RENDER_GIT_COMMIT en
// cada deploy con el commit que construyó; el smoke test del pipeline lo compara
// con el commit que acaba de verificar, y así no da verde contra la versión
// vieja mientras Render todavía está construyendo la nueva.
const VERSION = process.env.RENDER_GIT_COMMIT || process.env.GIT_SHA || 'desconocida';

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', base: 'ok', version: VERSION });
  } catch {
    res.status(503).json({ status: 'degradado', base: 'sin conexión', version: VERSION });
  }
});

app.use('/api/animales', animales);

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
