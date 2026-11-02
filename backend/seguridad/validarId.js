// Se registra con router.param('id', validarId): comprueba que :id sea un ObjectId válido
// antes de llegar al controlador.
const AppError = require('../utilidades/ErrorApp');
const { esObjectId } = require('../utilidades/validaciones');

function validarId(req, res, next, valor) {
  if (!esObjectId(valor)) {
    throw AppError.badRequest('ID_INVALIDO', 'El identificador indicado no es válido');
  }
  next();
}

module.exports = validarId;
