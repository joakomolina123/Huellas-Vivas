// Funciones pequeñas para leer y validar lo que llega en body, query y params.
// Además de validar, evitan "inyección NoSQL": un atacante podría mandar
// {"correo": {"$gt": ""}} en vez de un texto; aquí exigimos que sea un string.
const AppError = require('./ErrorApp');

const REGEX_OBJECT_ID = /^[0-9a-fA-F]{24}$/;

function esObjectId(valor) {
  return typeof valor === 'string' && REGEX_OBJECT_ID.test(valor);
}

// Copia solo los campos permitidos (evita que el cliente escriba campos que no corresponden).
function seleccionar(origen, permitidos) {
  const resultado = {};
  if (!origen || typeof origen !== 'object') return resultado;
  for (const campo of permitidos) {
    if (origen[campo] !== undefined) resultado[campo] = origen[campo];
  }
  return resultado;
}

// Exige un texto no vacío. Las contraseñas se piden con { recortar: false }.
function exigirTexto(valor, campo, { recortar = true } = {}) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw AppError.badRequest('DATOS_INVALIDOS', `El campo "${campo}" es obligatorio y debe ser texto`, [
      { campo, mensaje: 'Obligatorio' },
    ]);
  }
  return recortar ? valor.trim() : valor;
}

// Lee un filtro de texto desde req.query. Devuelve undefined si no viene.
function leerFiltroTexto(query, nombre) {
  const valor = query[nombre];
  if (valor === undefined || valor === '') return undefined;
  if (typeof valor !== 'string') {
    throw AppError.badRequest('FILTRO_INVALIDO', `El filtro "${nombre}" debe ser un texto`);
  }
  return valor.trim() || undefined;
}

// Lee un filtro true/false desde req.query. Devuelve undefined si no viene.
function leerFiltroBooleano(query, nombre) {
  const valor = leerFiltroTexto(query, nombre);
  if (valor === undefined) return undefined;
  if (valor === 'true' || valor === '1') return true;
  if (valor === 'false' || valor === '0') return false;
  throw AppError.badRequest('FILTRO_INVALIDO', `El filtro "${nombre}" debe ser true o false`);
}

module.exports = { esObjectId, seleccionar, exigirTexto, leerFiltroTexto, leerFiltroBooleano };
