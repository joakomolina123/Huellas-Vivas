// Paginación para listados largos (RNF01: el catálogo debe cargar rápido).
// Uso: ?page=2&limit=12  (limit máximo 50)
function leerPaginacion(query, limitePorDefecto = 12) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || limitePorDefecto, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

function armarPaginacion(total, page, limit) {
  return { page, limit, total, paginas: Math.ceil(total / limit) };
}

module.exports = { leerPaginacion, armarPaginacion };
