import { useEffect, useState } from 'react';
import { api } from './api.js';
import FormAnimal from './FormAnimal.jsx';
import Ficha from './Ficha.jsx';

export default function App() {
  const [animales, setAnimales] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [apiViva, setApiViva] = useState(true);

  async function cargar(q = busqueda) {
    try {
      setAnimales(await api.listarAnimales(q));
      setApiViva(true);
      setError(null);
    } catch (err) {
      setApiViva(false);
      setError(`No se pudo hablar con la API: ${err.message}`);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => cargar(), 250);
    return () => clearTimeout(t);
  }, [busqueda]);

  const activos = animales.filter((a) => a.estado === 'activo');
  const hembras = activos.filter((a) => a.sexo === 'hembra');

  return (
    <>
      <header className="top">
        <div className="top-in">
          <div className="logo">
            <span className="mark">🐄</span>
            Libreta del Rodeo
          </div>
          <span className="sp" />
          <span className="salud">
            <span className={`dot ${apiViva ? '' : 'err'}`} />
            {apiViva ? 'API conectada' : 'API sin responder'}
          </span>
        </div>
      </header>

      <main className="wrap">
        {seleccionado ? (
          <Ficha id={seleccionado} alVolver={() => setSeleccionado(null)} alCambiar={() => cargar()} />
        ) : (
          <>
            <div className="tiles">
              <div className="tile"><div className="k">En el rodeo</div><div className="v">{activos.length}</div></div>
              <div className="tile"><div className="k">Hembras activas</div><div className="v">{hembras.length}</div></div>
              <div className="tile"><div className="k">Registrados</div><div className="v">{animales.length}</div></div>
            </div>

            {error && <div className="aviso error">{error}</div>}

            <FormAnimal alCrear={() => cargar()} />

            <div className="barra">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por caravana o nombre…"
                aria-label="Buscar animal"
              />
            </div>

            {animales.length === 0 ? (
              <div className="panel">
                <p className="vacio">
                  No hay animales cargados todavía. Dá de alta el primero con el formulario de arriba.
                </p>
              </div>
            ) : (
              <div className="grid">
                {animales.map((a) => (
                  <button key={a.id} className="card" onClick={() => setSeleccionado(a.id)}>
                    <span className="car">CARAVANA {a.caravana}</span>
                    <span className="nm">{a.nombre || 'Sin nombre'}</span>
                    <span className="row">
                      <span className="pill">{a.categoria}</span>
                      {a.lote && <span className="pill lote">{a.lote}</span>}
                      <span className={`pill ${a.estado === 'activo' ? 'ok' : a.estado === 'vendido' ? 'warn' : 'crit'}`}>
                        {a.estado}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
