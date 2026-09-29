// Formatos para mostrar en pantalla.

// La edad como la dice un productor: "8 meses", "1 año y 3 meses", "3 años".
export function edadLegible(nacimiento, hoy = new Date()) {
  const nac = new Date(nacimiento);
  if (Number.isNaN(nac.getTime()) || nac > hoy) return '—';

  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
  if (hoy.getDate() < nac.getDate()) meses -= 1;

  if (meses < 1) return 'menos de un mes';
  if (meses < 12) return meses === 1 ? '1 mes' : `${meses} meses`;

  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const textoAnios = anios === 1 ? '1 año' : `${anios} años`;
  if (resto === 0) return textoAnios;
  return `${textoAnios} y ${resto === 1 ? '1 mes' : `${resto} meses`}`;
}
