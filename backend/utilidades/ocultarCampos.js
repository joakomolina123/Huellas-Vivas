// Transformación común para los modelos: _id -> id, y se ocultan __v y la contraseña
// en cualquier respuesta JSON.
function limpiarJson(doc, ret) {
  ret.id = String(ret._id);
  delete ret._id;
  delete ret.__v;
  delete ret.contrasena;
  return ret;
}

module.exports = limpiarJson;
