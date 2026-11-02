// Exige un token JWT válido en la cabecera "Authorization: Bearer <token>".
// Además consulta al usuario en la BD: si fue suspendido, pierde el acceso al instante.
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../configuracion/variables');
const Usuario = require('../modelos/Usuario');
const AppError = require('../utilidades/ErrorApp');

async function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw AppError.unauthorized('TOKEN_REQUERIDO', 'Debes iniciar sesión para realizar esta acción');
  }

  const payload = jwt.verify(token, jwtSecret); // si falla, errores.js lo traduce a 401
  const usuario = await Usuario.findById(payload.sub);
  if (!usuario) throw AppError.unauthorized('TOKEN_INVALIDO', 'La sesión ya no es válida');
  if (!usuario.activo) {
    throw AppError.forbidden('USUARIO_SUSPENDIDO', 'Tu cuenta está suspendida. Contacta al refugio');
  }

  req.usuario = usuario;
  next();
}

module.exports = autenticar;
