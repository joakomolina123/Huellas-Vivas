// Formato uniforme de las respuestas EXITOSAS: { ok: true, mensaje?, data }
// (las de error las arma utilidades/manejoErrores.js: { ok: false, error: {...} })
function enviarOk(res, status, data, mensaje) {
  const cuerpo = { ok: true };
  if (mensaje) cuerpo.mensaje = mensaje;
  cuerpo.data = data;
  return res.status(status).json(cuerpo);
}

module.exports = { enviarOk };
