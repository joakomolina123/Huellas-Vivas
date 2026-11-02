// RF04, RF07, RF08, RF10: solicitudes de adopción.
const Mascota = require('../modelos/Mascota');
const Solicitud = require('../modelos/Solicitud');
const AppError = require('../utilidades/ErrorApp');
const { enviarOk } = require('../utilidades/respuestas');
const { leerPaginacion, armarPaginacion } = require('../utilidades/paginacion');
const { esObjectId, leerFiltroTexto } = require('../utilidades/validaciones');

// POST /api/solicitudes  body: { "mascota": "<id>" }   (rol Usuario)
// El usuario sale del token: nadie puede postular en nombre de otra persona.
async function crear(req, res) {
  const mascotaId = req.body?.mascota;
  if (!esObjectId(mascotaId)) {
    throw AppError.badRequest('DATOS_INVALIDOS', 'Debes indicar el id de la mascota en el campo "mascota"', [
      { campo: 'mascota', mensaje: 'Id inválido' },
    ]);
  }

  const mascota = await Mascota.findById(mascotaId);
  if (!mascota) throw AppError.notFound('MASCOTA_NO_ENCONTRADA', 'La mascota no existe');
  if (mascota.estado !== 'Disponible') {
    throw AppError.conflict('MASCOTA_NO_DISPONIBLE', 'Esta mascota ya fue adoptada o no está disponible');
  }

  // RF10 (verificación amistosa; el índice único de la BD cubre el caso de carrera)
  const repetida = await Solicitud.exists({
    usuario: req.usuario._id, mascota: mascota._id, estado_solicitud: 'Pendiente',
  });
  if (repetida) {
    throw AppError.conflict('SOLICITUD_DUPLICADA', 'Ya tienes una solicitud pendiente para esta mascota');
  }

  const solicitud = await Solicitud.create({
    usuario: req.usuario._id,
    mascota: mascota._id,
    usuario_nombre: req.usuario.nombre,
    mascota_nombre: mascota.nombre,
  });
  enviarOk(res, 201, solicitud, 'Solicitud enviada correctamente');
}

// GET /api/solicitudes/mias  -> historial del usuario (RF08)
async function listarMias(req, res) {
  const solicitudes = await Solicitud.find({ usuario: req.usuario._id })
    .sort({ fecha_solicitud: -1 })
    .populate('mascota', 'nombre especie ciudad foto_url estado');
  enviarOk(res, 200, solicitudes);
}

// GET /api/solicitudes?estado=Pendiente&page=&limit=  (Administrador)
async function listarTodas(req, res) {
  const filtro = {};
  const estado = leerFiltroTexto(req.query, 'estado');
  if (estado) filtro.estado_solicitud = estado;

  const { page, limit, skip } = leerPaginacion(req.query, 20);
  const [items, total] = await Promise.all([
    Solicitud.find(filtro)
      .sort({ fecha_solicitud: -1 })
      .skip(skip)
      .limit(limit)
      .populate('usuario', 'nombre correo telefono')
      .populate('mascota', 'nombre especie ciudad foto_url estado'),
    Solicitud.countDocuments(filtro),
  ]);
  enviarOk(res, 200, { items, paginacion: armarPaginacion(total, page, limit) });
}

// PATCH /api/solicitudes/:id/aprobar  (Administrador) -> transacción, ver modelos/Solicitud.js
async function aprobar(req, res) {
  const { solicitud, mascota, rechazadas } = await Solicitud.aprobar(req.params.id);
  enviarOk(res, 200, { solicitud, mascota, rechazadas },
    'Adopción aprobada. Las demás solicitudes pendientes de la mascota fueron rechazadas');
}

// PATCH /api/solicitudes/:id/rechazar  (Administrador)
async function rechazar(req, res) {
  const solicitud = await Solicitud.rechazar(req.params.id);
  enviarOk(res, 200, solicitud, 'Solicitud rechazada');
}

module.exports = { crear, listarMias, listarTodas, aprobar, rechazar };
