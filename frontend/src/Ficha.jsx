import { useEffect, useState } from 'react';
import { api } from './api.js';

const hoy = () => new Date().toISOString().slice(0, 10);

export default function Ficha({ id, alVolver, alCambiar }) {
  const [animal, setAnimal] = useState(null);
  const [error, setError] = useState(null);
  const [pesada, setPesada] = useState({ fecha: hoy(), kg: '' });
  const [parto, setParto] = useState({ fecha: hoy(), cria_caravana: '', cria_sexo: '', cria_peso: '' });

  async function recargar() {
    try {
      setAnimal(await api.verAnimal(id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    recargar();
  }, [id]);

  async function accion(fn) {
    setError(null);
    try {
      await fn();
      await recargar();
      alCambiar?.();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !animal) return <div className="aviso error">{error}</div>;
  if (!animal) return <p className="vacio">Cargando…</p>;

  const activo = animal.estado === 'activo';
  const ultima = animal.pesadas.at(-1);

  return (
    <>
      <button className="btn ghost sm" onClick={alVolver} style={{ marginBottom: 14 }}>
        ← Volver al rodeo
      </button>

      {error && <div className="aviso error">{error}</div>}

      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="card-car" style={{ fontSize: 12.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 700 }}>
              Caravana {animal.caravana}
            </div>
            <h2 style={{ fontSize: 26 }}>{animal.nombre || 'Sin nombre'}</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn sm"
              disabled={!activo}
              onClick={() => accion(() => api.cambiarEstado(animal.id, 'vendido'))}
            >
              Marcar vendido
            </button>
            <button
              className="btn sm danger"
              disabled={!activo}
              onClick={() => accion(() => api.cambiarEstado(animal.id, 'muerto'))}
            >
              Marcar muerto
            </button>
          </div>
        </div>

        <div className="facts">
          <div className="fact"><div className="k">Categoría</div><div className="v">{animal.categoria}</div></div>
          <div className="fact"><div className="k">Sexo</div><div className="v">{animal.sexo}</div></div>
          <div className="fact"><div className="k">Nacimiento</div><div className="v">{String(animal.nacimiento).slice(0, 10)}</div></div>
          <div className="fact"><div className="k">Raza</div><div className="v">{animal.raza || '—'}</div></div>
          <div className="fact"><div className="k">Lote</div><div className="v">{animal.lote || '—'}</div></div>
          <div className="fact"><div className="k">Estado</div><div className="v">{animal.estado}</div></div>
          <div className="fact"><div className="k">Último peso</div><div className="v">{ultima ? `${ultima.kg} kg` : '—'}</div></div>
        </div>
      </div>

      <div className="panel">
        <h3>Pesadas</h3>
        {animal.pesadas.length === 0 ? (
          <p className="vacio">Todavía no hay pesadas registradas.</p>
        ) : (
          <table>
            <thead><tr><th>Fecha</th><th>Kilos</th></tr></thead>
            <tbody>
              {animal.pesadas.map((p) => (
                <tr key={p.id}>
                  <td>{String(p.fecha).slice(0, 10)}</td>
                  <td>{p.kg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="f2" style={{ marginTop: 14 }}>
          <div className="f">
            <label>Fecha</label>
            <input type="date" value={pesada.fecha} onChange={(e) => setPesada({ ...pesada, fecha: e.target.value })} />
          </div>
          <div className="f">
            <label>Kilos</label>
            <input type="number" step="0.1" value={pesada.kg} onChange={(e) => setPesada({ ...pesada, kg: e.target.value })} placeholder="430" />
          </div>
        </div>
        <button
          className="btn sm"
          disabled={!activo || !pesada.kg}
          onClick={() => accion(() => api.agregarPesada(animal.id, pesada))}
        >
          Registrar pesada
        </button>
      </div>

      <div className="panel">
        <h3>Partos</h3>
        {animal.partos.length === 0 ? (
          <p className="vacio">Sin partos registrados.</p>
        ) : (
          <table>
            <thead><tr><th>Fecha</th><th>Cría</th><th>Sexo</th><th>Peso</th></tr></thead>
            <tbody>
              {animal.partos.map((p) => (
                <tr key={p.id}>
                  <td>{String(p.fecha).slice(0, 10)}</td>
                  <td>{p.cria_caravana || '—'}</td>
                  <td>{p.cria_sexo || '—'}</td>
                  <td>{p.cria_peso ? `${p.cria_peso} kg` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="f2" style={{ marginTop: 14 }}>
          <div className="f">
            <label>Fecha del parto</label>
            <input type="date" value={parto.fecha} onChange={(e) => setParto({ ...parto, fecha: e.target.value })} />
          </div>
          <div className="f">
            <label>Caravana de la cría</label>
            <input value={parto.cria_caravana} onChange={(e) => setParto({ ...parto, cria_caravana: e.target.value })} placeholder="0231" />
          </div>
        </div>
        <button
          className="btn sm"
          disabled={!activo}
          onClick={() => accion(() => api.agregarParto(animal.id, parto))}
        >
          Registrar parto
        </button>
      </div>
    </>
  );
}
