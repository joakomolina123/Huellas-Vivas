// RF02, RF03 (catálogo y filtros) y RF05 (mantenedor de mascotas).
const Mascota = require('../modelos/Mascota');
const AppError = require('../utilidades/ErrorApp');
const { enviarOk } = require('../utilidades/respuestas');
const { leerPaginacion, armarPaginacion } = require('../utilidades/paginacion');
const {
  seleccionar,
  leerFiltroTexto,
  leerFiltroBooleano,
} = require('../utilidades/validaciones');

const CAMPOS_EDITABLES = [
  'nombre', 'especie', 'raza', 'sexo', 'edad_aprox', 'tamano',
  'ciudad', 'esterilizado', 'foto_url', 'descripcion',
];

async function buscarOFallar(id) {
  const mascota = await Mascota.findById(id);
  if (!mascota) throw AppError.notFound('MASCOTA_NO_ENCONTRADA', 'La mascota no existe');
  return mascota;
}

// GET /api/mascotas
async function listarCatalogo(req, res) {
  const ciudad = leerFiltroTexto(req.query, 'ciudad');
  
  // Se hace la ciudad opcional para evitar el error 400 (CIUDAD_REQUERIDA)
  const filtro = { estado: 'Disponible' };
  if (ciudad) filtro.ciudad = ciudad;

  for (const campo of ['especie', 'tamano', 'sexo']) {
    const valor = leerFiltroTexto(req.query, campo);
    if (valor) filtro[campo] = valor;
  }

  const esterilizado = leerFiltroBooleano(req.query, 'esterilizado');
  if (esterilizado !== undefined) filtro.esterilizado = esterilizado;

  const { page, limit, skip } = leerPaginacion(req.query);
  const [items, total] = await Promise.all([
    Mascota.find(filtro).sort({ fecha_ingreso: -1 }).skip(skip).limit(limit),
    Mascota.countDocuments(filtro),
  ]);

  enviarOk(res, 200, { items, paginacion: armarPaginacion(total, page, limit) });
}

// GET /api/mascotas/ciudades
async function listarCiudades(req, res) {
  const ciudades = await Mascota.distinct('ciudad', { estado: 'Disponible' });
  enviarOk(res, 200, ciudades.sort((a, b) => a.localeCompare(b, 'es')));
}

// GET /api/mascotas/gestion (Administrador)
async function listarGestion(req, res) {
  const filtro = {};
  for (const campo of ['estado', 'ciudad', 'especie']) {
    const valor = leerFiltroTexto(req.query, campo);
    if (valor) filtro[campo] = valor;
  }
  const { page, limit, skip } = leerPaginacion(req.query, 20);
  const [items, total] = await Promise.all([
    Mascota.find(filtro).sort({ fecha_modificacion: -1 }).skip(skip).limit(limit),
    Mascota.countDocuments(filtro),
  ]);
  enviarOk(res, 200, { items, paginacion: armarPaginacion(total, page, limit) });
}

// GET /api/mascotas/:id
async function obtener(req, res) {
  enviarOk(res, 200, await buscarOFallar(req.params.id));
}

// POST /api/mascotas
async function crear(req, res) {
  const mascota = await Mascota.create(seleccionar(req.body, CAMPOS_EDITABLES));
  enviarOk(res, 201, mascota, 'Mascota registrada correctamente');
}

// PUT /api/mascotas/:id
async function actualizar(req, res) {
  const mascota = await buscarOFallar(req.params.id);
  mascota.set(seleccionar(req.body, CAMPOS_EDITABLES));
  await mascota.save();
  enviarOk(res, 200, mascota, 'Mascota actualizada correctamente');
}

// PATCH /api/mascotas/:id/estado
async function cambiarEstado(req, res) {
  const estado = req.body?.estado;
  if (typeof estado !== 'string') {
    throw AppError.badRequest('DATOS_INVALIDOS', 'Debes indicar el "estado" (Disponible o Adoptada)', [
      { campo: 'estado', mensaje: 'Obligatorio' },
    ]);
  }
  const mascota = await buscarOFallar(req.params.id);
  mascota.estado = estado;
  await mascota.save();
  enviarOk(res, 200, mascota, 'Estado de la mascota actualizado');
}

module.exports = {
  listarCatalogo,
  listarCiudades,
  listarGestion,
  obtener,
  crear,
  actualizar,
  cambiarEstado,
};