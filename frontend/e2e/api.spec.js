import { expect, test } from '@playwright/test';

// SUITE DE INTEGRACIÓN (TP7): la api DESPLEGADA, con su PostgreSQL de verdad, sin
// navegador y sin ningún doble en el medio. El fixture `request` de Playwright es
// un cliente HTTP: no abre nada.
//
// Lo que ve que el unitario no: en servicio.test.js la base es un vi.fn() que
// contesta lo que le dijimos. Acá contesta PostgreSQL, pasando por el driver `pg`:
// la UNIQUE de la caravana, el tipo DATE de las fechas, el NUMERIC de los kilos,
// el ON DELETE CASCADE. Si algo de eso no se entiende con nuestro código, esto
// se pone rojo y los unitarios no.
//
// La dirección es la de la API, no la del front (son dos servicios). Sin barra final.
const API = process.env.API_BASE_URL || 'http://localhost:8080';

// Un nombre que no se repite: QA es uno solo y lo comparten todas las corridas.
const unico = (prefijo) => `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const vaca = (caravana) => ({ caravana, nombre: 'prueba api', sexo: 'hembra', nacimiento: '2022-01-10' });

async function buscar(request, texto) {
  const r = await request.get(`${API}/api/animales`, { params: { q: texto } });
  expect(r.status()).toBe(200);
  return r.json();
}

test('el alta guarda en la base de verdad, y el borrado la saca', async ({ request }) => {
  const caravana = unico('api');

  const alta = await request.post(`${API}/api/animales`, { data: vaca(caravana) });
  expect(alta.status()).toBe(201);
  const creado = await alta.json();
  expect(creado.categoria).toBe('vaca'); // la calcula la api, no se manda

  // El GET le pregunta a la BASE: si el INSERT no hubiera quedado, no aparece.
  const lista = await buscar(request, caravana);
  expect(lista.map((a) => a.caravana)).toEqual([caravana]);

  const borrado = await request.delete(`${API}/api/animales/${creado.id}`);
  expect(borrado.status()).toBe(204);

  expect(await buscar(request, caravana)).toEqual([]); // y el borrado, comprobado
});

test('un alta sin caravana la rechaza la api con 400, y no crea nada', async ({ request }) => {
  // No crea nada, así que no hay que limpiar. Lo marcamos con un nombre único
  // para poder buscarlo después: contar toda la lista no sirve en un QA compartido.
  const nombre = unico('sin-caravana');

  const alta = await request.post(`${API}/api/animales`, {
    data: { caravana: '', nombre, sexo: 'hembra', nacimiento: '2022-01-10' },
  });
  expect(alta.status()).toBe(400);
  expect((await alta.json()).errores).toContain('La caravana es obligatoria');

  expect(await buscar(request, nombre)).toEqual([]); // de verdad no se guardó
});

test('una pesada vuelve de la base con la fecha y los kilos que se cargaron', async ({ request }) => {
  // El dato que más se carga en el rodeo, y el que más pasa por los tipos de
  // PostgreSQL: la fecha es DATE y los kilos NUMERIC(6,1). Si el driver corre
  // la fecha un día por la zona horaria, o los kilos se redondean, es acá.
  const caravana = unico('api-pesada');
  const alta = await request.post(`${API}/api/animales`, { data: vaca(caravana) });
  expect(alta.status()).toBe(201);
  const { id } = await alta.json();

  const pesada = await request.post(`${API}/api/animales/${id}/pesadas`, {
    data: { fecha: '2026-09-01', kg: 432.5 },
  });
  expect(pesada.status()).toBe(201);

  const ficha = await request.get(`${API}/api/animales/${id}`);
  expect(ficha.status()).toBe(200);
  const { pesadas } = await ficha.json();
  expect(pesadas).toHaveLength(1);
  expect(String(pesadas[0].fecha).slice(0, 10)).toBe('2026-09-01');
  expect(Number(pesadas[0].kg)).toBe(432.5);

  // Limpieza, comprobada: el animal ya no existe (y su pesada se fue con él,
  // por el ON DELETE CASCADE de la tabla).
  expect((await request.delete(`${API}/api/animales/${id}`)).status()).toBe(204);
  expect((await request.get(`${API}/api/animales/${id}`)).status()).toBe(404);
});
