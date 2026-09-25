import { Router } from 'express';
import { repositorio } from '../repositorio.js';
import { crearServicio } from '../servicio.js';

// Las rutas quedaron finitas a propósito (TP5): piden, delegan y responden.
// Toda decisión vive en servicio.js y en reglas.js, que es lo que se testea.
// Acá se hace el cableado: al servicio se le pasa el repositorio REAL.
const servicio = crearServicio(repositorio);

export const animales = Router();

function responder(res, { status, cuerpo }) {
  res.status(status).json(cuerpo);
}

// GET /api/animales — listado, con búsqueda por caravana o nombre.
animales.get('/', async (req, res) => {
  responder(res, await servicio.listar(req.query.q ?? ''));
});

// GET /api/animales/:id — ficha completa con pesadas y partos.
animales.get('/:id', async (req, res) => {
  responder(res, await servicio.ficha(req.params.id));
});

// POST /api/animales — alta (regla 2).
animales.post('/', async (req, res) => {
  responder(res, await servicio.alta(req.body));
});

// PATCH /api/animales/:id/estado — cambio de estado (regla 5).
animales.patch('/:id/estado', async (req, res) => {
  responder(res, await servicio.cambiarEstado(req.params.id, req.body.estado));
});

// POST /api/animales/:id/pesadas — nueva pesada (reglas 3 y 6).
animales.post('/:id/pesadas', async (req, res) => {
  responder(res, await servicio.registrarPesada(req.params.id, req.body));
});

// POST /api/animales/:id/partos — nuevo parto (reglas 4 y 6).
animales.post('/:id/partos', async (req, res) => {
  responder(res, await servicio.registrarParto(req.params.id, req.body));
});
