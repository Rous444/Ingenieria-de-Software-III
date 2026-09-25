// Todas las llamadas usan RUTA RELATIVA (/api/...): el frontend no sabe en qué
// host ni en qué puerto vive el backend. En desarrollo lo resuelve el proxy de
// Vite; en contenedor, nginx. Por eso la misma imagen sirve en cualquier
// entorno, que es lo que el TP7 va a necesitar.
const BASE = '/api';

// TP5: el cliente recibe `fetch` DESDE AFUERA. Antes llamaba al fetch global
// adentro de `pedir`, y no había por dónde meterle un doble: probarlo exigía el
// backend levantado. Ahora `crearApi(unFetch)` arma el cliente con el fetch que
// le pases: en la app, el del navegador (abajo); en los tests, un vi.fn().
export function crearApi(unFetch) {
  async function pedir(url, opciones = {}) {
    const res = await unFetch(BASE + url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });

    const cuerpo = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      // El backend contesta { errores: [...] } en las validaciones y { error } en
      // el 404; si no mandó ninguno de los dos, al menos queda el código HTTP.
      const mensajes = cuerpo?.errores ?? [cuerpo?.error ?? `Error ${res.status}`];
      throw new Error(mensajes.join(' · '));
    }
    return cuerpo;
  }

  return {
    listarAnimales: (q = '') => pedir(`/animales?q=${encodeURIComponent(q)}`),
    verAnimal: (id) => pedir(`/animales/${id}`),
    crearAnimal: (datos) => pedir('/animales', { method: 'POST', body: JSON.stringify(datos) }),
    cambiarEstado: (id, estado) =>
      pedir(`/animales/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
    agregarPesada: (id, datos) =>
      pedir(`/animales/${id}/pesadas`, { method: 'POST', body: JSON.stringify(datos) }),
    agregarParto: (id, datos) =>
      pedir(`/animales/${id}/partos`, { method: 'POST', body: JSON.stringify(datos) }),
  };
}

// El cliente que usa la app de verdad, con el fetch del navegador. Los
// componentes siguen importando `api` igual que antes: no cambió nada para ellos.
export const api = crearApi((...args) => fetch(...args));
