// Todas las llamadas usan RUTA RELATIVA (/api/...): el frontend no sabe en qué
// host ni en qué puerto vive el backend. En desarrollo lo resuelve el proxy de
// Vite; en contenedor, nginx. Por eso la misma imagen sirve en cualquier
// entorno, que es lo que el TP7 va a necesitar.
const BASE = '/api';

async function pedir(url, opciones = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  const cuerpo = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const mensajes = cuerpo?.errores ?? [cuerpo?.error ?? `Error ${res.status}`];
    throw new Error(mensajes.join(' · '));
  }
  return cuerpo;
}

export const api = {
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
