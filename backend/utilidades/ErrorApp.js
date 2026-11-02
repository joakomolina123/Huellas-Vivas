// Error "esperado" de la aplicación: lleva el código HTTP, un código interno
// legible por el frontend y un mensaje claro. El middleware de errores lo convierte en JSON.
class AppError extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }

  static badRequest(codigo, mensaje, detalles) { return new AppError(400, codigo, mensaje, detalles); }
  static unauthorized(codigo, mensaje) { return new AppError(401, codigo, mensaje); }
  static forbidden(codigo, mensaje) { return new AppError(403, codigo, mensaje); }
  static notFound(codigo, mensaje) { return new AppError(404, codigo, mensaje); }
  static conflict(codigo, mensaje) { return new AppError(409, codigo, mensaje); }
}

module.exports = AppError;
