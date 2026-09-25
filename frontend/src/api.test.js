import { describe, it, expect, vi } from 'vitest';
import { crearApi } from './api.js';

// El fetch se reemplaza por un doble: no sale nada a la red. `respuesta` fabrica
// lo mínimo de un Response que usa `pedir` (ok, status y json()).
function respuesta(status, cuerpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  };
}

describe('cliente de la API', () => {
  it('manda la pesada por POST a la ruta del animal, con el cuerpo en JSON', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(201, { id: 1 }));
    const api = crearApi(fetchFalso);

    await api.agregarPesada(7, { fecha: '2026-09-01', kg: 450 });

    expect(fetchFalso).toHaveBeenCalledTimes(1);
    const [url, opciones] = fetchFalso.mock.calls[0];
    expect(url).toBe('/api/animales/7/pesadas');
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual({ fecha: '2026-09-01', kg: 450 });
  });

  it('escapa lo que el usuario escribe en el buscador', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(200, []));

    await crearApi(fetchFalso).listarAnimales('AR 01&x');

    expect(fetchFalso).toHaveBeenCalledWith('/api/animales?q=AR%2001%26x', expect.anything());
  });

  it.each([
    ['la lista de errores de validación', 400, { errores: ['uno', 'dos'] }, 'uno · dos'],
    ['el error suelto del 404', 404, { error: 'No existe ese animal' }, 'No existe ese animal'],
    ['el código HTTP si no vino cuerpo', 500, null, 'Error 500'],
  ])('ante una respuesta con error muestra %s', async (_caso, status, cuerpo, mensaje) => {
    const api = crearApi(vi.fn().mockResolvedValue(respuesta(status, cuerpo)));

    await expect(api.verAnimal(1)).rejects.toThrow(mensaje);
  });
});
