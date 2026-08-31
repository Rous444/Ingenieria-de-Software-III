import pg from 'pg';

const { Pool } = pg;

// La conexión NUNCA se escribe en el código: entra por variable de entorno.
// En desarrollo apunta al PostgreSQL que levantás con docker run; en el compose
// del TP2 apunta al servicio `db`; en el TP6 va a apuntar a QA y a producción.
// La misma imagen, distinta configuración según dónde corra.
if (!process.env.DATABASE_URL) {
  throw new Error(
    'Falta la variable DATABASE_URL. En desarrollo la carga el script `npm run dev` ' +
    'desde el archivo .env (copialo de .env.example); en contenedor la inyecta el compose.'
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// El esquema se crea al arrancar. La base del compose nace vacía, así que si la
// app no aplicara el esquema sola, el sistema levantaría sin tablas.
export async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS animal (
      id         SERIAL PRIMARY KEY,
      caravana   TEXT        NOT NULL UNIQUE,
      nombre     TEXT,
      raza       TEXT,
      sexo       TEXT        NOT NULL,
      nacimiento DATE        NOT NULL,
      lote       TEXT,
      estado     TEXT        NOT NULL DEFAULT 'activo',
      creado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS pesada (
      id        SERIAL PRIMARY KEY,
      animal_id INTEGER      NOT NULL REFERENCES animal(id) ON DELETE CASCADE,
      fecha     DATE         NOT NULL,
      kg        NUMERIC(6,1) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parto (
      id            SERIAL PRIMARY KEY,
      animal_id     INTEGER      NOT NULL REFERENCES animal(id) ON DELETE CASCADE,
      fecha         DATE         NOT NULL,
      cria_caravana TEXT,
      cria_sexo     TEXT,
      cria_peso     NUMERIC(5,1),
      observaciones TEXT
    );
  `);
}
