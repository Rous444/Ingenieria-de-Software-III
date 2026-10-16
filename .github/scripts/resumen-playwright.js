// Escribe en el Summary de la corrida cuántas pruebas de Playwright pasaron.
// Lee el reporte JSON (playwright.config.js lo deja en frontend/resultados-playwright.json).
// Uso: node .github/scripts/resumen-playwright.js "Título" >> "$GITHUB_STEP_SUMMARY"
const fs = require('fs');

const titulo = process.argv[2] || 'Playwright';
const archivo = 'frontend/resultados-playwright.json';

console.log(`### ${titulo}`);
if (!fs.existsSync(archivo)) {
  console.log('Las pruebas no llegaron a correr (no hay reporte): mirá el log del paso anterior.');
  process.exit(0);
}

const { expected, unexpected, flaky, skipped } = JSON.parse(fs.readFileSync(archivo, 'utf8')).stats;
console.log('| pasaron | fallaron | flaky | salteadas |');
console.log('|---|---|---|---|');
console.log(`| ${expected} | ${unexpected} | ${flaky} | ${skipped} |`);
console.log('');
console.log(`**${expected} passed**${unexpected ? `, ${unexpected} failed` : ''}${flaky ? `, ${flaky} flaky (pasaron recién al reintentar: mirá el reporte)` : ''}`);
