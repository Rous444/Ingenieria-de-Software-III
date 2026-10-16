import { expect, test } from '@playwright/test';

// SUITE E2E (TP7): un Chromium de verdad usando el front DESPLEGADO, que habla
// con su api y su base de verdad. Nada de page.route ni de mocks: si el navegador
// no le pega a la api, no es end-to-end.
//
// Se busca como busca una persona: por el texto del label o del botón
// (getByLabel, getByRole), no por clases CSS que cambian con el diseño.
// Y sin sleep: cada expect espera solo, hasta su tope (playwright.config.js).

const unico = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const tarjeta = (page, caravana) => page.getByRole('button', { name: `Caravana ${caravana}` });

async function darDeAlta(page, caravana) {
  await page.getByLabel('Caravana').fill(caravana);
  await page.getByLabel('Nombre').fill('prueba e2e');
  await page.getByLabel('Sexo').selectOption('hembra');
  await page.getByLabel('Nacimiento').fill('2022-01-10');
  await page.getByRole('button', { name: 'Dar de alta' }).click();
}

async function borrarDesdeLaFicha(page, caravana) {
  await tarjeta(page, caravana).click();
  page.once('dialog', (d) => d.accept()); // el "¿Borrar la caravana…?" del navegador
  await page.getByRole('button', { name: `Borrar caravana ${caravana}` }).click();
  await expect(tarjeta(page, caravana)).toHaveCount(0); // y el borrado, comprobado
}

// Red de seguridad: si un test se cae a la mitad, su animal quedaría en QA y
// ensuciaría las corridas siguientes. Esto lo borra igual, por la api (a través
// del nginx del front, que es la única dirección que esta suite conoce). En un
// test que terminó bien no encuentra nada: ya lo borró el propio test.
let creados = [];
test.afterEach(async ({ request }) => {
  for (const caravana of creados) {
    const r = await request.get('/api/animales', { params: { q: caravana } });
    for (const a of r.ok() ? await r.json() : []) await request.delete(`/api/animales/${a.id}`);
  }
  creados = [];
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('API conectada')).toBeVisible();
});

test('dar de alta un animal lo muestra en el rodeo, y borrarlo lo saca', async ({ page }) => {
  const caravana = unico();
  creados.push(caravana);

  await darDeAlta(page, caravana);
  await expect(tarjeta(page, caravana)).toBeVisible(); // el dato que ESTE test creó

  await borrarDesdeLaFicha(page, caravana);
});

test('una caravana repetida muestra el error y no crea un segundo animal', async ({ page }) => {
  const caravana = unico();
  creados.push(caravana);
  await darDeAlta(page, caravana);
  await expect(tarjeta(page, caravana)).toBeVisible();

  await darDeAlta(page, caravana); // la misma otra vez: la UNIQUE de la base la rechaza

  await expect(page.getByRole('alert')).toContainText(`Ya existe un animal con la caravana ${caravana}`);
  await expect(tarjeta(page, caravana)).toHaveCount(1); // sigue habiendo UNO solo

  await borrarDesdeLaFicha(page, caravana);
});

test('registrar una pesada en la ficha la deja en el historial', async ({ page }) => {
  // El flujo de todos los días: en la manga se pesa y se carga. Si mañana no
  // anda, el que escribe es el que está pesando.
  const caravana = unico();
  creados.push(caravana);
  await darDeAlta(page, caravana);
  await tarjeta(page, caravana).click();

  await page.getByLabel('Kilos').fill('432.5');
  await page.getByRole('button', { name: 'Registrar pesada' }).click();

  await expect(page.getByRole('cell', { name: '432.5 kg' })).toBeVisible(); // vuelve de la base
  await expect(page.getByText('Todavía no hay pesadas registradas.')).toHaveCount(0);

  await page.getByRole('button', { name: 'Volver al rodeo' }).click();
  await borrarDesdeLaFicha(page, caravana);
});
