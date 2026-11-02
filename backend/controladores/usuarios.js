// RF06: mantenedor de usuarios (solo Administrador).
const Usuario = require('../modelos/Usuario');
const AppError = require('../utilidades/ErrorApp');
const { enviarOk } = require('../utilidades/respuestas');
const { leerPaginacion, armarPaginacion } = require('../utilidades/paginacion');
const { seleccionar, leerFiltroTexto, leerFiltroBooleano } = require('../utilidades/validaciones');

async function buscarOFallar(id) {
  const usuario = await Usuario.findById(id);
  if (!usuario) throw AppError.notFound('USUARIO_NO_ENCONTRADO', 'El usuario no existe');
  return usuario;
}

// GET /api/usuarios?activo=true&rol=Usuario&page=&limit=
async function listar(req, res) {
  const filtro = {};
  const activo = leerFiltroBooleano(req.query, 'activo');
  if (activo !== undefined) filtro.activo = activo;
  const rol = leerFiltroTexto(req.query, 'rol');
  if (rol) filtro.rol = rol;

  const { page, limit, skip } = leerPaginacion(req.query, 20);
  const [items, total] = await Promise.all([
    Usuario.find(filtro).sort({ fecha_registro: -1 }).skip(skip).limit(limit),
    Usuario.countDocuments(filtro),
  ]);
  enviarOk(res, 200, { items, paginacion: armarPaginacion(total, page, limit) });
}

// PUT /api/usuarios/:id  -> solo datos de contacto
async function actualizar(req, res) {
  const usuario = await buscarOFallar(req.params.id);
  usuario.set(seleccionar(req.body, ['nombre', 'correo', 'telefono']));
  await usuario.save();
  enviarOk(res, 200, usuario, 'Usuario actualizado correctamente');
}

// PATCH /api/usuarios/:id/estado  body: { "activo": false }  (suspender o reactivar)
async function cambiarEstado(req, res) {
  const { activo } = req.body || {};
  if (typeof activo !== 'boolean') {
    throw AppError.badRequest('DATOS_INVALIDOS', 'El campo "activo" debe ser true o false', [
      { campo: 'activo', mensaje: 'Debe ser booleano' },
    ]);
  }
  if (req.params.id === req.usuario.id && activo === false) {
    throw AppError.conflict('AUTOSUSPENSION', 'No puedes suspender tu propia cuenta');
  }

  const usuario = await buscarOFallar(req.params.id);
  usuario.activo = activo;
  await usuario.save();
  enviarOk(res, 200, usuario, activo ? 'Cuenta reactivada' : 'Cuenta suspendida');
}

module.exports = { listar, actualizar, cambiarEstado };
