import { pool } from './db.js';

// El repositorio es la FRONTERA con PostgreSQL: el único lugar del backend que
// escribe SQL. No tiene reglas de negocio, sólo pide y guarda filas.
//
// Existe como pieza separada desde el TP5: antes, las rutas hablaban con `pool`
// directamente y las reglas de "¿admite novedades?" o "¿la transición es válida?"
// quedaban mezcladas con el SQL. Así no había forma de probarlas sin una base
// levantada. Ahora el servicio (servicio.js) recibe ESTE objeto desde afuera, y
// en los tests recibe un doble.
export const repositorio = {
  async listarAnimales(texto) {
    const q = `%${texto}%`;
    const { rows } = await pool.query(
      `SELECT * FROM animal
        WHERE caravana ILIKE $1 OR COALESCE(nombre, '') ILIKE $1
        ORDER BY caravana`,
      [q]
    );
    return rows;
  },

  async buscarAnimal(id) {
    const { rows } = await pool.query('SELECT * FROM animal WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async novedadesDe(id) {
    const [pesadas, partos] = await Promise.all([
      pool.query('SELECT * FROM pesada WHERE animal_id = $1 ORDER BY fecha', [id]),
      pool.query('SELECT * FROM parto  WHERE animal_id = $1 ORDER BY fecha', [id]),
    ]);
    return { pesadas: pesadas.rows, partos: partos.rows };
  },

  async insertarAnimal({ caravana, nombre, raza, sexo, nacimiento, lote }) {
    const { rows } = await pool.query(
      `INSERT INTO animal (caravana, nombre, raza, sexo, nacimiento, lote)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [caravana, nombre, raza, sexo, nacimiento, lote]
    );
    return rows[0];
  },

  async actualizarEstado(id, estado) {
    const { rows } = await pool.query(
      'UPDATE animal SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    return rows[0];
  },

  async insertarPesada(animalId, { fecha, kg }) {
    const { rows } = await pool.query(
      'INSERT INTO pesada (animal_id, fecha, kg) VALUES ($1, $2, $3) RETURNING *',
      [animalId, fecha, kg]
    );
    return rows[0];
  },

  async insertarParto(animalId, { fecha, cria_caravana, cria_sexo, cria_peso, observaciones }) {
    const { rows } = await pool.query(
      `INSERT INTO parto (animal_id, fecha, cria_caravana, cria_sexo, cria_peso, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [animalId, fecha, cria_caravana, cria_sexo, cria_peso, observaciones]
    );
    return rows[0];
  },
};
