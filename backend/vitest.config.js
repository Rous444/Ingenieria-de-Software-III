import { defineConfig } from 'vitest/config';

// Las fechas sin hora ('2026-03-10') JavaScript las interpreta en UTC, y el
// contenedor de producción corre en UTC. Fijamos la misma zona para los tests:
// si no, en una máquina con hora argentina un borde de "24 meses justos" se
// corre un día y el test cambia de resultado según dónde se corra.
process.env.TZ = 'UTC';

export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      // QUÉ ENTRA EN LA CUENTA: todo src/, menos lo que se nombra abajo. Es un
      // exclude a propósito (no un include de archivos sueltos): un archivo
      // nuevo en src/ entra solo a la medición, y si no tiene tests el número
      // baja y el gate avisa.
      include: ['src/**/*.js'],
      exclude: [
        'src/index.js', //        el arranque: crea Express, monta rutas, escucha el puerto
        'src/db.js', //           la conexión y el CREATE TABLE: infraestructura, sin reglas
        'src/repositorio.js', //  SQL puro contra PostgreSQL: se verifica con la base de verdad (TP7)
        'src/rutas/**', //        pegamento HTTP: pide, delega en el servicio y responde
      ],
      thresholds: { lines: 90, branches: 85 },
    },
  },
});
