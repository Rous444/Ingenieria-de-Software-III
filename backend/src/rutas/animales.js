import { Router } from 'express';
import { pool } from '../db.js';
import {
  categoriaDe,
  validarAnimal,
  validarPesada,
  validarParto,
  transicionValida,
  admiteNovedades,
} from '../reglas.js';

export const animales = Router();

// Le agrega a cada fila la categoría calculada (regla 1).
function conCategoria(fila) {
  return { ...fila, categoria: categoriaDe(fila.sexo, fila.nacimiento) };
}

// GET /api/animales — listado, con búsqueda por caravana o nombre.
animales.get('/', async (req, res) => {
  const q = `%${(req.query.q ?? '').toString().trim()}%`;
  const { rows } = await pool.query(
    `SELECT * FROM animal
      WHERE caravana ILIKE $1 OR COALESCE(nombre, '') ILIKE $1
      ORDER BY caravana`,
    [q]
  );
  res.json(rows.map(conCategoria));
});

// GET /api/animales/:id — ficha completa con pesadas y partos.
animales.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM animal WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'No existe ese animal' });

  const [pesadas, partos] = await Promise.all([
    pool.query('SELECT * FROM pesada WHERE animal_id = $1 ORDER BY fecha', [req.params.id]),
    pool.query('SELECT * FROM parto  WHERE animal_id = $1 ORDER BY fecha', [req.params.id]),
  ]);

  res.json({ ...conCategoria(rows[0]), pesadas: pesadas.rows, partos: partos.rows });
});

// POST /api/animales — alta.
animales.post('/', async (req, res) => {
  const errores = validarAnimal(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });

  const { caravana, nombre, raza, sexo, nacimiento, lote } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO animal (caravana, nombre, raza, sexo, nacimiento, lote)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [String(caravana).trim(), nombre || null, raza || null, sexo, nacimiento, lote || null]
    );
    res.status(201).json(conCategoria(rows[0]));
  } catch (err) {
    // 23505 = violación de UNIQUE. La caravana es única (regla del negocio, y
    // además restricción de la base: se defiende en los dos lados).
    if (err.code === '23505') {
      return res.status(409).json({ errores: [`Ya existe un animal con la caravana ${caravana}`] });
    }
    throw err;
  }
});

// PATCH /api/animales/:id/estado — cambio de estado (regla 5).
animales.patch('/:id/estado', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM animal WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'No existe ese animal' });

  const animal = rows[0];
  const nuevo = req.body.estado;

  if (!transicionValida(animal.estado, nuevo)) {
    return res.status(409).json({
      errores: [`No se puede pasar de "${animal.estado}" a "${nuevo}"`],
    });
  }

  const { rows: actualizado } = await pool.query(
    'UPDATE animal SET estado = $1 WHERE id = $2 RETURNING *',
    [nuevo, req.params.id]
  );
  res.json(conCategoria(actualizado[0]));
});

// POST /api/animales/:id/pesadas — nueva pesada (regla 3).
animales.post('/:id/pesadas', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM animal WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'No existe ese animal' });

  const animal = rows[0];
  if (!admiteNovedades(animal)) {
    return res.status(409).json({ errores: [`El animal está ${animal.estado}: no admite novedades`] });
  }

  const errores = validarPesada(req.body, animal);
  if (errores.length > 0) return res.status(400).json({ errores });

  const { rows: creada } = await pool.query(
    'INSERT INTO pesada (animal_id, fecha, kg) VALUES ($1, $2, $3) RETURNING *',
    [animal.id, req.body.fecha, req.body.kg]
  );
  res.status(201).json(creada[0]);
});

// POST /api/animales/:id/partos — nuevo parto (regla 4).
animales.post('/:id/partos', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM animal WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'No existe ese animal' });

  const animal = rows[0];
  if (!admiteNovedades(animal)) {
    return res.status(409).json({ errores: [`El animal está ${animal.estado}: no admite novedades`] });
  }

  const errores = validarParto(req.body, animal);
  if (errores.length > 0) return res.status(400).json({ errores });

  const { fecha, cria_caravana, cria_sexo, cria_peso, observaciones } = req.body;
  const { rows: creado } = await pool.query(
    `INSERT INTO parto (animal_id, fecha, cria_caravana, cria_sexo, cria_peso, observaciones)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [animal.id, fecha, cria_caravana || null, cria_sexo || null, cria_peso || null, observaciones || null]
  );
  res.status(201).json(creado[0]);
});
