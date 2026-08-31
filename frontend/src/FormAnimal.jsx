import { useState } from 'react';
import { api } from './api.js';
import { validarFormularioAnimal, formularioValido } from './validacion.js';

const VACIO = { caravana: '', nombre: '', raza: '', sexo: '', nacimiento: '', lote: '' };

export default function FormAnimal({ alCrear }) {
  const [datos, setDatos] = useState(VACIO);
  const [errorApi, setErrorApi] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const errores = validarFormularioAnimal(datos);
  const puedeGuardar = formularioValido(errores) && !guardando;

  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrorApi(null);
  }

  async function enviar(e) {
    e.preventDefault();
    if (!puedeGuardar) return;

    setGuardando(true);
    try {
      const creado = await api.crearAnimal(datos);
      setDatos(VACIO);
      alCrear(creado);
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="panel" onSubmit={enviar}>
      <h3>Dar de alta un animal</h3>

      {errorApi && <div className="aviso error">{errorApi}</div>}

      <div className="f2">
        <div className="f">
          <label htmlFor="caravana">Caravana *</label>
          <input
            id="caravana"
            value={datos.caravana}
            onChange={(e) => cambiar('caravana', e.target.value)}
            placeholder="0142"
          />
        </div>
        <div className="f">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            value={datos.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Manchada"
          />
        </div>
      </div>

      <div className="f2">
        <div className="f">
          <label htmlFor="sexo">Sexo *</label>
          <select id="sexo" value={datos.sexo} onChange={(e) => cambiar('sexo', e.target.value)}>
            <option value="">Elegí…</option>
            <option value="hembra">Hembra</option>
            <option value="macho">Macho</option>
          </select>
        </div>
        <div className="f">
          <label htmlFor="nacimiento">Nacimiento *</label>
          <input
            id="nacimiento"
            type="date"
            value={datos.nacimiento}
            onChange={(e) => cambiar('nacimiento', e.target.value)}
          />
        </div>
      </div>

      <div className="f2">
        <div className="f">
          <label htmlFor="raza">Raza</label>
          <input id="raza" value={datos.raza} onChange={(e) => cambiar('raza', e.target.value)} placeholder="Holando" />
        </div>
        <div className="f">
          <label htmlFor="lote">Lote</label>
          <input id="lote" value={datos.lote} onChange={(e) => cambiar('lote', e.target.value)} placeholder="Lote 3" />
        </div>
      </div>

      {/* El botón queda deshabilitado mientras el formulario no sea válido:
          la categoría la calcula el backend, así que acá sólo verificamos que
          los datos mínimos estén y que la fecha no sea futura. */}
      <button className="btn primary" disabled={!puedeGuardar}>
        {guardando ? 'Guardando…' : 'Dar de alta'}
      </button>

      {!formularioValido(errores) && (
        <div className="aviso error" style={{ marginTop: 14, marginBottom: 0 }}>
          Falta completar:
          <ul>
            {Object.values(errores).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
