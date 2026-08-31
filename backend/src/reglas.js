// Reglas de negocio del rodeo.
//
// Todo lo que hay en este archivo son FUNCIONES PURAS: reciben datos, devuelven
// datos, y no tocan la base ni el request de Express. Es una decisión de diseño
// a propósito — así las reglas se pueden probar con tests unitarios sin levantar
// ni el servidor ni PostgreSQL (lo vamos a necesitar en el TP5).

export const SEXOS = ['hembra', 'macho'];
export const ESTADOS = ['activo', 'vendido', 'muerto'];

// Qué estados puede tomar un animal a partir del que tiene.
// Un animal vendido o muerto es un estado terminal: no vuelve a activo.
const TRANSICIONES = {
  activo: ['vendido', 'muerto'],
  vendido: [],
  muerto: [],
};

// Rango de peso plausible por categoría, en kilos. Sirve para detectar errores
// de carga: un ternero de 800 kg es un dedo equivocado, no un ternero.
export const RANGO_PESO = {
  ternero: [25, 250],
  ternera: [25, 250],
  vaquillona: [180, 480],
  novillito: [180, 520],
  novillo: [300, 750],
  vaca: [300, 800],
};

export function aFecha(valor) {
  const f = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(f.getTime()) ? null : f;
}

// Meses completos entre dos fechas.
export function mesesEntre(desde, hasta) {
  const a = aFecha(desde);
  const b = aFecha(hasta);
  if (!a || !b) return null;
  let meses = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) meses -= 1;
  return meses;
}

// REGLA 1 — La categoría no se carga: se calcula a partir del sexo y la edad.
export function categoriaDe(sexo, nacimiento, hoy = new Date()) {
  const meses = mesesEntre(nacimiento, hoy);
  if (meses === null || meses < 0) return null;
  if (meses < 12) return sexo === 'hembra' ? 'ternera' : 'ternero';
  if (sexo === 'hembra') return meses < 24 ? 'vaquillona' : 'vaca';
  return meses < 24 ? 'novillito' : 'novillo';
}

// REGLA 2 — Un animal necesita caravana, sexo válido y una fecha de nacimiento
// que exista y que no sea futura.
export function validarAnimal(datos, hoy = new Date()) {
  const errores = [];
  const caravana = String(datos.caravana ?? '').trim();

  if (!caravana) errores.push('La caravana es obligatoria');
  if (!SEXOS.includes(datos.sexo)) {
    errores.push(`El sexo debe ser ${SEXOS.join(' o ')}`);
  }

  const nac = aFecha(datos.nacimiento);
  if (!nac) errores.push('La fecha de nacimiento no es una fecha válida');
  else if (nac > aFecha(hoy)) errores.push('La fecha de nacimiento no puede ser futura');

  if (datos.estado !== undefined && !ESTADOS.includes(datos.estado)) {
    errores.push(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }

  return errores;
}

// REGLA 3 — El peso tiene que ser positivo y coherente con la categoría.
export function validarPesada(pesada, animal, hoy = new Date()) {
  const errores = [];
  const kg = Number(pesada.kg);

  if (!Number.isFinite(kg) || kg <= 0) {
    errores.push('El peso tiene que ser un número mayor que cero');
  }

  const fecha = aFecha(pesada.fecha);
  if (!fecha) errores.push('La fecha de la pesada no es válida');
  else if (fecha > aFecha(hoy)) errores.push('La fecha de la pesada no puede ser futura');
  else if (fecha < aFecha(animal.nacimiento)) {
    errores.push('La pesada no puede ser anterior al nacimiento del animal');
  }

  if (errores.length === 0) {
    const categoria = categoriaDe(animal.sexo, animal.nacimiento, fecha);
    const rango = RANGO_PESO[categoria];
    if (rango && (kg < rango[0] || kg > rango[1])) {
      errores.push(
        `${kg} kg está fuera del rango esperable para un/a ${categoria} (${rango[0]}-${rango[1]} kg)`
      );
    }
  }

  return errores;
}

// REGLA 4 — Sólo se puede registrar un parto de una hembra que tuviera al menos
// 24 meses a la fecha del parto.
export const EDAD_MINIMA_PARTO_MESES = 24;

export function validarParto(parto, animal, hoy = new Date()) {
  const errores = [];

  if (animal.sexo !== 'hembra') {
    errores.push('Sólo se puede registrar un parto de una hembra');
  }

  const fecha = aFecha(parto.fecha);
  if (!fecha) {
    errores.push('La fecha del parto no es válida');
  } else {
    if (fecha > aFecha(hoy)) errores.push('La fecha del parto no puede ser futura');
    const edad = mesesEntre(animal.nacimiento, fecha);
    if (edad !== null && edad < EDAD_MINIMA_PARTO_MESES) {
      errores.push(
        `El animal tenía ${edad} meses a la fecha del parto: el mínimo es ${EDAD_MINIMA_PARTO_MESES}`
      );
    }
  }

  return errores;
}

// REGLA 5 — Las transiciones de estado permitidas.
export function transicionValida(actual, nuevo) {
  return (TRANSICIONES[actual] ?? []).includes(nuevo);
}

// REGLA 6 — Un animal que no está activo no admite carga de novedades.
export function admiteNovedades(animal) {
  return animal.estado === 'activo';
}
