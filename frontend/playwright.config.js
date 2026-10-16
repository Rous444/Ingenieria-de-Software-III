import { defineConfig } from '@playwright/test';

// TP7: Playwright corre las DOS suites que viven en e2e/, cada una con su archivo:
//   e2e/api.spec.js       integración: pedidos HTTP a la api de QA, sin navegador
//   e2e/animales.spec.js  end-to-end: un Chromium de verdad usando el front de QA
// Cada job del pipeline corre la suya por nombre de archivo.
//
// Las direcciones NO están escritas acá: entran por variable de entorno. Así el
// mismo test apunta a tu compose local o a QA sin cambiar una línea.
export default defineConfig({
  testDir: './e2e',
  // Tope de CADA test. Generoso a propósito: QA está en el plan gratis de Render,
  // que duerme y tarda en despertar. En el pipeline ya lo despertaron el smoke y
  // la integración, pero un pedido suelto por internet igual se puede demorar.
  timeout: 60_000,
  // Tope de CADA aserción (no lo hereda del de arriba: el default es 5 s). Es lo
  // que reemplaza a los sleep: Playwright reintenta la aserción hasta este tope.
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000', // el FRONT (la api tiene la suya: API_BASE_URL)
    trace: 'on-first-retry', //       la traza se graba en el reintento de un fallo
    screenshot: 'only-on-failure', // captura de cada fallo, en el reporte
  },
  // UN reintento: absorbe una demora suelta de la red. Si un test pasa recién ahí,
  // el reporte lo marca "flaky" aunque la corrida quede verde: hay que mirarlo.
  retries: 1,
  // html: el reporte que se publica como artefacto. list: lo que se lee en el log.
  // json: lo lee .github/scripts/resumen-playwright.js para el Summary de la corrida.
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'resultados-playwright.json' }],
  ],
});
