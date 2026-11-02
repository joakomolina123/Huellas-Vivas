// Consultas funcionales con agregaciones de MongoDB (Administrador).
// Usan el pipeline de agregación: unir colecciones ($lookup), filtrar ($match, $in),
// agrupar y contar ($group). El frontend las muestra en la pantalla de reportes.
const Mascota = require('../modelos/Mascota');
const Solicitud = require('../modelos/Solicitud');
const Usuario = require('../modelos/Usuario');
const { enviarOk } = require('../utilidades/respuestas');
const { leerFiltroTexto } = require('../utilidades/validaciones');

// Nombres reales de las colecciones (así no se escriben "a mano" en los $lookup)
const COL_MASCOTAS = Mascota.collection.name;
const COL_USUARIOS = Usuario.collection.name;

// GET /api/reportes/solicitudes-por-mascota
async function solicitudesPorMascota(req, res) {
  const datos = await Solicitud.aggregate([
    {
      $group: {
        _id: '$mascota',
        total: { $sum: 1 },
        pendientes: { $sum: { $cond: [{ $eq: ['$estado_solicitud', 'Pendiente'] }, 1, 0] } },
      },
    },
    { $lookup: { from: COL_MASCOTAS, localField: '_id', foreignField: '_id', as: 'mascota' } },
    { $unwind: '$mascota' },
    {
      $project: {
        _id: 0,
        mascota_id: '$_id',
        nombre: '$mascota.nombre',
        especie: '$mascota.especie',
        ciudad: '$mascota.ciudad',
        estado: '$mascota.estado',
        total: 1,
        pendientes: 1,
      },
    },
    { $sort: { total: -1, nombre: 1 } },
  ]);
  enviarOk(res, 200, datos);
}

// GET /api/reportes/adopciones-por-ciudad
async function adopcionesPorCiudad(req, res) {
  const datos = await Solicitud.aggregate([
    { $match: { estado_solicitud: 'Aprobada' } },
    { $lookup: { from: COL_MASCOTAS, localField: 'mascota', foreignField: '_id', as: 'mascota' } },
    { $unwind: '$mascota' },
    { $group: { _id: '$mascota.ciudad', adopciones: { $sum: 1 } } },
    { $project: { _id: 0, ciudad: '$_id', adopciones: 1 } },
    { $sort: { adopciones: -1, ciudad: 1 } },
  ]);
  enviarOk(res, 200, datos);
}

// GET /api/reportes/solicitudes-detalle?estado=Pendiente,Aprobada
async function solicitudesDetalle(req, res) {
  const estados = (leerFiltroTexto(req.query, 'estado') || '')
    .split(',').map((e) => e.trim()).filter(Boolean);
  const filtro = estados.length > 0 ? { estado_solicitud: { $in: estados } } : {};

  const datos = await Solicitud.aggregate([
    { $match: filtro },
    { $lookup: { from: COL_USUARIOS, localField: 'usuario', foreignField: '_id', as: 'usuario' } },
    { $unwind: '$usuario' },
    { $lookup: { from: COL_MASCOTAS, localField: 'mascota', foreignField: '_id', as: 'mascota' } },
    { $unwind: '$mascota' },
    {
      $project: {
        _id: 0,
        solicitud_id: '$_id',
        fecha_solicitud: 1,
        estado_solicitud: 1,
        usuario: '$usuario.nombre',
        correo: '$usuario.correo',
        mascota: '$mascota.nombre',
        especie: '$mascota.especie',
        ciudad: '$mascota.ciudad',
      },
    },
    { $sort: { fecha_solicitud: -1 } },
    { $limit: 100 },
  ]);
  enviarOk(res, 200, datos);
}

// GET /api/reportes/mascotas-por-especie
async function mascotasPorEspecie(req, res) {
  const datos = await Mascota.aggregate([
    {
      $group: {
        _id: '$especie',
        total: { $sum: 1 },
        disponibles: { $sum: { $cond: [{ $eq: ['$estado', 'Disponible'] }, 1, 0] } },
        adoptadas: { $sum: { $cond: [{ $eq: ['$estado', 'Adoptada'] }, 1, 0] } },
        edad_promedio: { $avg: '$edad_aprox' },
      },
    },
    {
      $project: {
        _id: 0, especie: '$_id', total: 1, disponibles: 1, adoptadas: 1,
        edad_promedio: { $round: ['$edad_promedio', 1] },
      },
    },
    { $sort: { total: -1 } },
  ]);
  enviarOk(res, 200, datos);
}

module.exports = { solicitudesPorMascota, adopcionesPorCiudad, solicitudesDetalle, mascotasPorEspecie };
