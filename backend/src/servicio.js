import {
  categoriaDe,
  validarAnimal,
  validarPesada,
  validarParto,
  transicionValida,
  admiteNovedades,
} from './reglas.js';

// Los casos de uso del rodeo: cargan lo que haga falta, aplican las reglas y
// deciden qué se guarda. Cada uno devuelve { status, cuerpo }, y la ruta de
// Express sólo copia eso a la respuesta HTTP.
//
// La dependencia con la base ENTRA DESDE AFUERA (el parámetro `repo`). En
// producción es repositorio.js; en los tests es un doble hecho con vi.fn().
// Si este archivo importara `pool` directamente, no habría por dónde meter el
// doble y cada test necesitaría PostgreSQL levantado.

// 23505 = violación de UNIQUE en PostgreSQL. La caravana es única (regla del
// negocio y además restricción de la base: se defiende en los dos lados).
const CARAVANA_DUPLICADA = '23505';

const noExiste = { status: 404, cuerpo: { error: 'No existe ese animal' } };

function conCategoria(fila, hoy) {
  return { ...fila, categoria: categoriaDe(fila.sexo, fila.nacimiento, hoy) };
}

function vacioANull(valor) {
  return valor === undefined || valor === '' ? null : valor;
}

export function crearServicio(repo) {
  // Paso común a pesadas y partos: el animal tiene que existir y estar activo.
  async function animalQueAdmiteNovedades(id) {
    const animal = await repo.buscarAnimal(id);
    if (!animal) return { rechazo: noExiste };
    if (!admiteNovedades(animal)) {
      return {
        rechazo: {
          status: 409,
          cuerpo: { errores: [`El animal está ${animal.estado}: no admite novedades`] },
        },
      };
    }
    return { animal };
  }

  return {
    async listar(texto = '', hoy = new Date()) {
      const filas = await repo.listarAnimales(String(texto).trim());
      return { status: 200, cuerpo: filas.map((f) => conCategoria(f, hoy)) };
    },

    async ficha(id, hoy = new Date()) {
      const animal = await repo.buscarAnimal(id);
      if (!animal) return noExiste;
      const novedades = await repo.novedadesDe(id);
      return { status: 200, cuerpo: { ...conCategoria(animal, hoy), ...novedades } };
    },

    async alta(datos, hoy = new Date()) {
      const errores = validarAnimal(datos, hoy);
      if (errores.length > 0) return { status: 400, cuerpo: { errores } };

      const caravana = String(datos.caravana).trim();
      try {
        const creado = await repo.insertarAnimal({
          caravana,
          nombre: vacioANull(datos.nombre),
          raza: vacioANull(datos.raza),
          sexo: datos.sexo,
          nacimiento: datos.nacimiento,
          lote: vacioANull(datos.lote),
        });
        return { status: 201, cuerpo: conCategoria(creado, hoy) };
      } catch (err) {
        if (err.code === CARAVANA_DUPLICADA) {
          return {
            status: 409,
            cuerpo: { errores: [`Ya existe un animal con la caravana ${caravana}`] },
          };
        }
        throw err;
      }
    },

    async cambiarEstado(id, nuevo, hoy = new Date()) {
      const animal = await repo.buscarAnimal(id);
      if (!animal) return noExiste;

      if (!transicionValida(animal.estado, nuevo)) {
        return {
          status: 409,
          cuerpo: { errores: [`No se puede pasar de "${animal.estado}" a "${nuevo}"`] },
        };
      }

      const actualizado = await repo.actualizarEstado(id, nuevo);
      return { status: 200, cuerpo: conCategoria(actualizado, hoy) };
    },

    async registrarPesada(id, datos, hoy = new Date()) {
      const { animal, rechazo } = await animalQueAdmiteNovedades(id);
      if (rechazo) return rechazo;

      const errores = validarPesada(datos, animal, hoy);
      if (errores.length > 0) return { status: 400, cuerpo: { errores } };

      const creada = await repo.insertarPesada(animal.id, { fecha: datos.fecha, kg: datos.kg });
      return { status: 201, cuerpo: creada };
    },

    async registrarParto(id, datos, hoy = new Date()) {
      const { animal, rechazo } = await animalQueAdmiteNovedades(id);
      if (rechazo) return rechazo;

      const errores = validarParto(datos, animal, hoy);
      if (errores.length > 0) return { status: 400, cuerpo: { errores } };

      const creado = await repo.insertarParto(animal.id, {
        fecha: datos.fecha,
        cria_caravana: vacioANull(datos.cria_caravana),
        cria_sexo: vacioANull(datos.cria_sexo),
        cria_peso: vacioANull(datos.cria_peso),
        observaciones: vacioANull(datos.observaciones),
      });
      return { status: 201, cuerpo: creado };
    },
  };
}
