// Validación del formulario de alta, del lado del navegador.
//
// Es una función pura a propósito: se puede probar sin montar React ni tocar la
// red (lo vamos a usar en los tests de frontend del TP5).
//
// Ojo: esto NO reemplaza la validación del backend. El navegador valida para dar
// una respuesta inmediata; el servidor valida porque es el único lugar en el que
// se puede confiar — cualquiera puede llamar a la API sin pasar por este form.
export function validarFormularioAnimal(datos, hoy = new Date()) {
  const errores = {};

  if (!String(datos.caravana ?? '').trim()) {
    errores.caravana = 'Poné el número de caravana';
  }

  if (!datos.sexo) {
    errores.sexo = 'Elegí el sexo del animal';
  }

  if (!datos.nacimiento) {
    errores.nacimiento = 'Poné la fecha de nacimiento';
  } else {
    const nac = new Date(datos.nacimiento);
    if (Number.isNaN(nac.getTime())) errores.nacimiento = 'Esa fecha no existe';
    else if (nac > hoy) errores.nacimiento = 'La fecha no puede ser futura';
  }

  return errores;
}

export function formularioValido(errores) {
  return Object.keys(errores).length === 0;
}
