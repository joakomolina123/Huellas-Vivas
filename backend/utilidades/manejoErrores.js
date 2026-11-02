// Manejo CENTRAL de errores: cualquier error de la API termina aquí y sale con el mismo
// formato:  { ok: false, error: { codigo, mensaje, detalles? } }
const AppError = require('./ErrorApp');

// Ruta que no existe -> 404
function rutaNoEncontrada(req, res, next) {
  next(AppError.notFound('RUTA_NO_ENCONTRADA', `La ruta ${req.method} ${req.originalUrl} no existe`));
}

// Un índice único de MongoDB se violó (código 11000): se traduce según el campo.
function traducirDuplicado(err) {
  const campos = Object.keys(err.keyPattern || {});
  if (campos.includes('correo')) return AppError.conflict('CORREO_DUPLICADO', 'Ya existe una cuenta con ese correo');
  if (campos.includes('rut')) return AppError.conflict('RUT_DUPLICADO', 'Ya existe una cuenta con ese RUT');
  if (campos.includes('usuario') && campos.includes('mascota')) {
    return AppError.conflict('SOLICITUD_DUPLICADA', 'Ya tienes una solicitud pendiente para esta mascota');
  }
  if (campos.includes('mascota')) {
    return AppError.conflict('MASCOTA_YA_ADOPTADA', 'Esta mascota ya tiene una adopción aprobada');
  }
  return AppError.conflict('REGISTRO_DUPLICADO', 'Ya existe un registro con esos datos');
}

// Convierte errores de Mongoose, JWT y Express en AppError. Devuelve null si es desconocido.
function traducir(err) {
  if (err instanceof AppError) return err;

  if (err.name === 'ValidationError' && err.errors) {
    const detalles = Object.values(err.errors).map((e) => ({ campo: e.path, mensaje: e.message }));
    return AppError.badRequest('DATOS_INVALIDOS', 'Hay datos inválidos en la solicitud', detalles);
  }
  if (err.name === 'CastError') {
    return AppError.badRequest('DATOS_INVALIDOS', `El valor del campo "${err.path}" no es válido`);
  }
  if (err.code === 11000) return traducirDuplicado(err);

  if (err.name === 'TokenExpiredError') {
    return AppError.unauthorized('TOKEN_EXPIRADO', 'Tu sesión expiró. Inicia sesión nuevamente');
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return AppError.unauthorized('TOKEN_INVALIDO', 'La sesión no es válida. Inicia sesión nuevamente');
  }

  if (err.type === 'entity.parse.failed') {
    return AppError.badRequest('JSON_INVALIDO', 'El cuerpo de la petición no es un JSON válido');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(413, 'PETICION_MUY_GRANDE', 'El cuerpo de la petición es demasiado grande');
  }
  return null;
}

// Express reconoce un manejador de errores por sus 4 parámetros: no quitar "next".
// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  const error = traducir(err);
  if (error) {
    const cuerpo = { codigo: error.codigo, mensaje: error.mensaje };
    if (error.detalles) cuerpo.detalles = error.detalles;
    return res.status(error.status).json({ ok: false, error: cuerpo });
  }

  // Error inesperado: se registra en el log del servidor, pero NO se filtra al cliente.
  console.error('Error inesperado:', err);
  return res.status(500).json({
    ok: false,
    error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado en el servidor' },
  });
}

module.exports = { rutaNoEncontrada, manejarErrores };
