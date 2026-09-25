import { describe, it, expect, vi } from 'vitest';
import { crearServicio } from '../src/servicio.js';

// Tests del servicio con la base REEMPLAZADA por un doble.
//
// `repoFalso` arma un objeto con la misma forma que repositorio.js, pero cada
// método es un vi.fn(): no hay PostgreSQL, no hay red. Cada test le dice qué
// contestar (stub) y, cuando importa, verifica qué le pidieron (mock).
const HOY = new Date('2026-09-25T12:00:00');

function repoFalso(sobrescribir = {}) {
  return {
    listarAnimales: vi.fn().mockResolvedValue([]),
    buscarAnimal: vi.fn().mockResolvedValue(null),
    novedadesDe: vi.fn().mockResolvedValue({ pesadas: [], partos: [] }),
    insertarAnimal: vi.fn(),
    actualizarEstado: vi.fn(),
    insertarPesada: vi.fn(),
    insertarParto: vi.fn(),
    ...sobrescribir,
  };
}

const vacaActiva = { id: 7, sexo: 'hembra', nacimiento: '2022-01-10', estado: 'activo' };

describe('registrarPesada', () => {
  it('guarda la pesada válida de un animal activo, con los datos correctos', async () => {
    const repo = repoFalso({
      buscarAnimal: vi.fn().mockResolvedValue(vacaActiva),
      insertarPesada: vi.fn().mockResolvedValue({ id: 1, animal_id: 7, kg: 450 }),
    });
    const servicio = crearServicio(repo);

    const r = await servicio.registrarPesada('7', { fecha: '2026-09-01', kg: 450 }, HOY);

    expect(r.status).toBe(201);
    expect(repo.insertarPesada).toHaveBeenCalledTimes(1);
    expect(repo.insertarPesada).toHaveBeenCalledWith(7, { fecha: '2026-09-01', kg: 450 });
  });

  it('NO toca la base si el animal está vendido', async () => {
    const repo = repoFalso({
      buscarAnimal: vi.fn().mockResolvedValue({ ...vacaActiva, estado: 'vendido' }),
    });

    const r = await crearServicio(repo).registrarPesada('7', { fecha: '2026-09-01', kg: 450 }, HOY);

    expect(r.status).toBe(409);
    expect(r.cuerpo.errores[0]).toContain('vendido');
    expect(repo.insertarPesada).not.toHaveBeenCalled();
  });

  it('NO toca la base si la pesada es inválida', async () => {
    const repo = repoFalso({ buscarAnimal: vi.fn().mockResolvedValue(vacaActiva) });

    const r = await crearServicio(repo).registrarPesada('7', { fecha: '2026-09-01', kg: 5000 }, HOY);

    expect(r.status).toBe(400);
    expect(repo.insertarPesada).not.toHaveBeenCalled();
  });

  it('contesta 404 si el animal no existe', async () => {
    const r = await crearServicio(repoFalso()).registrarPesada('99', { kg: 1 }, HOY);

    expect(r).toEqual({ status: 404, cuerpo: { error: 'No existe ese animal' } });
  });
});

describe('cambiarEstado', () => {
  it('vende un animal activo: pide el UPDATE con el estado nuevo', async () => {
    const repo = repoFalso({
      buscarAnimal: vi.fn().mockResolvedValue(vacaActiva),
      actualizarEstado: vi.fn().mockResolvedValue({ ...vacaActiva, estado: 'vendido' }),
    });

    const r = await crearServicio(repo).cambiarEstado('7', 'vendido', HOY);

    expect(r.status).toBe(200);
    expect(r.cuerpo).toMatchObject({ estado: 'vendido', categoria: 'vaca' });
    expect(repo.actualizarEstado).toHaveBeenCalledWith('7', 'vendido');
  });

  it('rechaza revivir un animal muerto sin llamar al UPDATE', async () => {
    const repo = repoFalso({
      buscarAnimal: vi.fn().mockResolvedValue({ ...vacaActiva, estado: 'muerto' }),
    });

    const r = await crearServicio(repo).cambiarEstado('7', 'activo', HOY);

    expect(r.status).toBe(409);
    expect(r.cuerpo.errores).toEqual(['No se puede pasar de "muerto" a "activo"']);
    expect(repo.actualizarEstado).not.toHaveBeenCalled();
  });
});

describe('registrarParto', () => {
  it('guarda el parto de una vaca activa y convierte los campos vacíos en null', async () => {
    const repo = repoFalso({
      buscarAnimal: vi.fn().mockResolvedValue(vacaActiva),
      insertarParto: vi.fn().mockResolvedValue({ id: 3 }),
    });

    const r = await crearServicio(repo).registrarParto(
      '7',
      { fecha: '2026-08-01', cria_caravana: 'AR-100', cria_sexo: '', cria_peso: '' },
      HOY
    );

    expect(r.status).toBe(201);
    expect(repo.insertarParto).toHaveBeenCalledWith(7, {
      fecha: '2026-08-01',
      cria_caravana: 'AR-100',
      cria_sexo: null,
      cria_peso: null,
      observaciones: null,
    });
  });

  it('NO toca la base si el parto es de un macho', async () => {
    const repo = repoFalso({
      buscarAnimal: vi.fn().mockResolvedValue({ ...vacaActiva, sexo: 'macho' }),
    });

    const r = await crearServicio(repo).registrarParto('7', { fecha: '2026-08-01' }, HOY);

    expect(r.status).toBe(400);
    expect(repo.insertarParto).not.toHaveBeenCalled();
  });
});

describe('alta', () => {
  it('traduce la caravana duplicada de la base (23505) a un 409 legible', async () => {
    const duplicada = Object.assign(new Error('duplicate key'), { code: '23505' });
    const repo = repoFalso({ insertarAnimal: vi.fn().mockRejectedValue(duplicada) });

    const r = await crearServicio(repo).alta(
      { caravana: ' AR-001 ', sexo: 'macho', nacimiento: '2025-01-01' },
      HOY
    );

    expect(r).toEqual({
      status: 409,
      cuerpo: { errores: ['Ya existe un animal con la caravana AR-001'] },
    });
    // la caravana se guarda sin los espacios, y los opcionales vacíos como null
    expect(repo.insertarAnimal).toHaveBeenCalledWith(
      expect.objectContaining({ caravana: 'AR-001', nombre: null, lote: null })
    );
  });

  it('no se traga un error de la base que no sabe traducir', async () => {
    const caida = Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' });
    const repo = repoFalso({ insertarAnimal: vi.fn().mockRejectedValue(caida) });

    const alta = crearServicio(repo).alta(
      { caravana: 'AR-002', sexo: 'macho', nacimiento: '2025-01-01' },
      HOY
    );

    await expect(alta).rejects.toThrow('connection refused');
  });

  it('no llama a la base si los datos no pasan la validación', async () => {
    const repo = repoFalso();

    const r = await crearServicio(repo).alta({ caravana: '', sexo: 'macho', nacimiento: '2025-01-01' }, HOY);

    expect(r).toEqual({ status: 400, cuerpo: { errores: ['La caravana es obligatoria'] } });
    expect(repo.insertarAnimal).not.toHaveBeenCalled();
  });
});
