// Utilidades para el RUT chileno: normalización y dígito verificador (módulo 11).

// Deja solo dígitos y K y devuelve "12345678-5" (sin puntos, con guion).
function normalizarRut(valor) {
  if (typeof valor !== 'string') return null;
  const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length < 2) return null;
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

function validarRut(valor) {
  const rut = normalizarRut(valor);
  if (!rut) return false;
  const [cuerpo, dv] = rut.split('-');
  if (!/^\d{7,8}$/.test(cuerpo)) return false;
  return calcularDigitoVerificador(cuerpo) === dv;
}

module.exports = { normalizarRut, validarRut, calcularDigitoVerificador };
