import { describe, it, expect } from 'vitest';
import { validarFormularioAnimal, formularioValido } from './validacion.js';

const HOY = new Date('2026-09-25T12:00:00');
const completo = { caravana: 'AR-001', sexo: 'hembra', nacimiento: '2024-05-01' };

describe('validarFormularioAnimal', () => {
  it('no marca ningún error en un formulario completo', () => {
    const errores = validarFormularioAnimal(completo, HOY);

    expect(errores).toEqual({});
    expect(formularioValido(errores)).toBe(true);
  });

  it.each([
    ['caravana', { caravana: '   ' }, 'Poné el número de caravana'],
    ['sexo', { sexo: '' }, 'Elegí el sexo del animal'],
    ['nacimiento', { nacimiento: '' }, 'Poné la fecha de nacimiento'],
  ])('marca el campo %s cuando falta', (campo, cambio, mensaje) => {
    const errores = validarFormularioAnimal({ ...completo, ...cambio }, HOY);

    expect(errores).toEqual({ [campo]: mensaje });
    expect(formularioValido(errores)).toBe(false);
  });

  it('rechaza una fecha de nacimiento futura', () => {
    const errores = validarFormularioAnimal({ ...completo, nacimiento: '2026-09-26T12:00:00' }, HOY);

    expect(errores.nacimiento).toBe('La fecha no puede ser futura');
  });

  it('rechaza una fecha que no existe', () => {
    const errores = validarFormularioAnimal({ ...completo, nacimiento: '2026-02-31x' }, HOY);

    expect(errores.nacimiento).toBe('Esa fecha no existe');
  });
});
