// Restringe una ruta a ciertos roles. Se usa DESPUÉS de "autenticar".
// Ejemplo: router.post('/', autenticar, autorizar('Administrador'), controlador)
const AppError = require('../utilidades/ErrorApp');

function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw AppError.forbidden('SIN_PERMISO', 'No tienes permisos para realizar esta acción');
    }
    next();
  };
}

module.exports = autorizar;
