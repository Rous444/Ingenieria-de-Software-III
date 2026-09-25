import { describe, it, expect } from 'vitest';
import {
  mesesEntre,
  categoriaDe,
  validarAnimal,
  validarPesada,
  validarParto,
  transicionValida,
  admiteNovedades,
} from '../src/reglas.js';

// Todas las reglas reciben `hoy` por parámetro: los tests fijan la fecha y no
// dependen del reloj de la máquina (un test que cambia de resultado según el día
// en que corre es un test flaky).
const HOY = new Date('2026-09-25T12:00:00');

// ── Regla 1: la categoría se calcula por sexo y edad ─────────────────────────
describe('categoriaDe', () => {
  it.each([
    // sexo,     nacimiento,    esperado      — por qué ese dato
    ['hembra', '2026-03-10', 'ternera'], //    6 meses
    ['macho', '2026-03-10', 'ternero'], //     6 meses
    ['hembra', '2025-09-25', 'vaquillona'], // 12 meses justos: el borde de ternera
    ['macho', '2025-09-26', 'ternero'], //     11 meses y un día de menos: todavía ternero
    ['hembra', '2024-09-26', 'vaquillona'], // 23 meses: todavía vaquillona
    ['hembra', '2024-09-25', 'vaca'], //       24 meses justos: el borde de vaca
    ['macho', '2025-01-10', 'novillito'], //   20 meses
    ['macho', '2024-09-25', 'novillo'], //     24 meses justos
  ])('un/a %s nacido/a el %s es %s', (sexo, nacimiento, esperado) => {
    expect(categoriaDe(sexo, nacimiento, HOY)).toBe(esperado);
  });

  it('no inventa una categoría si la fecha de nacimiento no es válida o es futura', () => {
    expect(categoriaDe('hembra', 'no-es-fecha', HOY)).toBeNull();
    expect(categoriaDe('hembra', '2027-01-01', HOY)).toBeNull();
  });
});

describe('mesesEntre', () => {
  it('no cuenta el mes si todavía no se llegó al mismo día', () => {
    // del 31/1 al 28/2 no es un mes completo: el día 31 todavía no llegó
    expect(mesesEntre('2026-01-31', '2026-02-28')).toBe(0);
    expect(mesesEntre('2026-01-15', '2026-02-15')).toBe(1);
  });
});

// ── Regla 2: alta de animal ──────────────────────────────────────────────────
describe('validarAnimal', () => {
  const valido = { caravana: 'AR-001', sexo: 'hembra', nacimiento: '2024-05-01' };

  it('acepta un animal con caravana, sexo y nacimiento válidos', () => {
    expect(validarAnimal(valido, HOY)).toEqual([]);
  });

  it.each([
    ['vacía', ''],
    ['sólo espacios', '   '],
    ['ausente', undefined],
  ])('rechaza una caravana %s', (_caso, caravana) => {
    const errores = validarAnimal({ ...valido, caravana }, HOY);

    expect(errores).toEqual(['La caravana es obligatoria']);
  });

  it('rechaza una fecha de nacimiento futura, pero acepta la de hoy', () => {
    expect(validarAnimal({ ...valido, nacimiento: '2026-09-26T12:00:00' }, HOY)).toEqual([
      'La fecha de nacimiento no puede ser futura',
    ]);
    expect(validarAnimal({ ...valido, nacimiento: HOY }, HOY)).toEqual([]);
  });

  it('junta todos los errores en vez de cortar en el primero', () => {
    const errores = validarAnimal(
      { caravana: '', sexo: 'otro', nacimiento: 'x', estado: 'perdido' },
      HOY
    );

    expect(errores).toHaveLength(4);
    expect(errores).toContain('El sexo debe ser hembra o macho');
    expect(errores).toContain('La fecha de nacimiento no es una fecha válida');
    expect(errores).toContain('El estado debe ser uno de: activo, vendido, muerto');
  });
});

// ── Regla 3: pesadas ─────────────────────────────────────────────────────────
describe('validarPesada', () => {
  // Ternero de 6 meses: su rango plausible es 25-250 kg
  const ternero = { sexo: 'macho', nacimiento: '2026-03-10' };

  it.each([
    ['cero', 0],
    ['negativo', -5],
    ['no numérico', 'mucho'],
  ])('rechaza un peso %s', (_caso, kg) => {
    const errores = validarPesada({ kg, fecha: '2026-09-20' }, ternero, HOY);

    expect(errores).toEqual(['El peso tiene que ser un número mayor que cero']);
  });

  it('acepta los dos bordes del rango de la categoría y rechaza un kilo afuera', () => {
    const pesar = (kg) => validarPesada({ kg, fecha: '2026-09-20' }, ternero, HOY);

    expect(pesar(25)).toEqual([]);
    expect(pesar(250)).toEqual([]);
    expect(pesar(251)).toEqual([
      '251 kg está fuera del rango esperable para un/a ternero (25-250 kg)',
    ]);
    expect(pesar(24)).toHaveLength(1);
  });

  it('calcula la categoría a la FECHA DE LA PESADA, no a la de hoy', () => {
    // Vaquillona hoy (15 meses), pero ternera cuando se la pesó (5 meses):
    // 300 kg es mucho para una ternera aunque sea normal para una vaquillona.
    const vaquillona = { sexo: 'hembra', nacimiento: '2025-06-01' };

    const errores = validarPesada({ kg: 300, fecha: '2025-11-01' }, vaquillona, HOY);

    expect(errores[0]).toContain('ternera');
  });

  it('rechaza una pesada anterior al nacimiento o futura', () => {
    expect(validarPesada({ kg: 50, fecha: '2026-01-01' }, ternero, HOY)).toEqual([
      'La pesada no puede ser anterior al nacimiento del animal',
    ]);
    expect(validarPesada({ kg: 50, fecha: '2026-10-01' }, ternero, HOY)).toEqual([
      'La fecha de la pesada no puede ser futura',
    ]);
  });
});

// ── Regla 4: partos ──────────────────────────────────────────────────────────
describe('validarParto', () => {
  const vaca = { sexo: 'hembra', nacimiento: '2023-01-10' };

  it('acepta el parto de una hembra que cumple justo 24 meses ese día', () => {
    expect(validarParto({ fecha: '2025-01-10' }, vaca, HOY)).toEqual([]);
  });

  it('rechaza el parto de una hembra a la que le falta un día para los 24 meses', () => {
    const errores = validarParto({ fecha: '2025-01-09' }, vaca, HOY);

    expect(errores).toEqual([
      'El animal tenía 23 meses a la fecha del parto: el mínimo es 24',
    ]);
  });

  it('rechaza el parto de un macho', () => {
    const errores = validarParto({ fecha: '2026-01-01' }, { ...vaca, sexo: 'macho' }, HOY);

    expect(errores).toEqual(['Sólo se puede registrar un parto de una hembra']);
  });

  it('rechaza una fecha de parto inválida o futura', () => {
    expect(validarParto({ fecha: 'ayer' }, vaca, HOY)).toEqual(['La fecha del parto no es válida']);
    expect(validarParto({ fecha: '2026-12-01' }, vaca, HOY)).toEqual([
      'La fecha del parto no puede ser futura',
    ]);
  });
});

// ── Reglas 5 y 6: estados ────────────────────────────────────────────────────
describe('transicionValida', () => {
  it.each([
    ['activo', 'vendido', true],
    ['activo', 'muerto', true],
    ['vendido', 'activo', false], // terminal: un vendido no vuelve
    ['muerto', 'activo', false], //  terminal
    ['activo', 'activo', false], //  no es una transición
    ['activo', 'perdido', false], // estado nuevo inexistente
    ['perdido', 'vendido', false], // estado ACTUAL inexistente (dato corrupto): el `??` de la regla
  ])('de %s a %s → %s', (actual, nuevo, esperado) => {
    expect(transicionValida(actual, nuevo)).toBe(esperado);
  });
});

describe('admiteNovedades', () => {
  it.each([
    ['activo', true],
    ['vendido', false],
    ['muerto', false],
  ])('un animal %s admite novedades: %s', (estado, esperado) => {
    expect(admiteNovedades({ estado })).toBe(esperado);
  });
});
