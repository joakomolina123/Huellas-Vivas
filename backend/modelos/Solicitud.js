// Colección "solicitudes". Referencia a usuario y mascota por _id (no se embebe todo
// porque la mascota cambia de estado y el usuario puede tener muchas solicitudes),
// pero guarda una COPIA MÍNIMA de los nombres para mostrar listados sin hacer $lookup.
const mongoose = require('mongoose');
const AppError = require('../utilidades/ErrorApp');
const limpiarJson = require('../utilidades/ocultarCampos');

const ESTADOS = ['Pendiente', 'Aprobada', 'Rechazada'];

const solicitudSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    mascota: { type: mongoose.Schema.Types.ObjectId, ref: 'Mascota', required: true },
    usuario_nombre: { type: String, required: true }, // copia mínima
    mascota_nombre: { type: String, required: true }, // copia mínima
    estado_solicitud: { type: String, enum: ESTADOS, default: 'Pendiente' },
  },
  {
    collection: 'solicitudes',
    timestamps: { createdAt: 'fecha_solicitud', updatedAt: 'fecha_actualizacion' },
    toJSON: { transform: limpiarJson },
  }
);

// RF10: una persona no puede tener 2 solicitudes PENDIENTES por la misma mascota.
solicitudSchema.index(
  { usuario: 1, mascota: 1 },
  { unique: true, partialFilterExpression: { estado_solicitud: 'Pendiente' } }
);

// RF07 / RNF02: como máximo UNA solicitud APROBADA por mascota. La garantiza la propia
// base de datos, incluso si dos administradores aprueban al mismo tiempo.
solicitudSchema.index(
  { mascota: 1 },
  { unique: true, partialFilterExpression: { estado_solicitud: 'Aprobada' } }
);

// Historial del usuario (RF08)
solicitudSchema.index({ usuario: 1, fecha_solicitud: -1 });

// Aprueba una solicitud con una TRANSACCIÓN de MongoDB (reemplaza SELECT ... FOR UPDATE):
//   1) la solicitud pasa de Pendiente a Aprobada
//   2) la mascota pasa de Disponible a Adoptada
//   3) las demás solicitudes pendientes de esa mascota pasan a Rechazada
// Si cualquier paso falla, no se guarda nada. Requiere un replica set (Atlas lo trae).
solicitudSchema.statics.aprobar = async function aprobar(id) {
  const Mascota = mongoose.model('Mascota');
  const session = await mongoose.startSession();
  try {
    let resultado;
    await session.withTransaction(async () => {
      const solicitud = await this.findOneAndUpdate(
        { _id: id, estado_solicitud: 'Pendiente' },
        { estado_solicitud: 'Aprobada' },
        { new: true, session }
      );
      if (!solicitud) {
        const existe = await this.exists({ _id: id }).session(session);
        throw existe
          ? AppError.conflict('SOLICITUD_YA_RESUELTA', 'La solicitud ya fue aprobada o rechazada')
          : AppError.notFound('SOLICITUD_NO_ENCONTRADA', 'La solicitud no existe');
      }

      const mascota = await Mascota.findOneAndUpdate(
        { _id: solicitud.mascota, estado: 'Disponible' },
        { estado: 'Adoptada' },
        { new: true, session }
      );
      if (!mascota) {
        throw AppError.conflict('MASCOTA_YA_ADOPTADA', 'La mascota ya fue adoptada o no está disponible');
      }

      const rechazo = await this.updateMany(
        { mascota: solicitud.mascota, _id: { $ne: solicitud._id }, estado_solicitud: 'Pendiente' },
        { estado_solicitud: 'Rechazada' },
        { session }
      );

      resultado = { solicitud, mascota, rechazadas: rechazo.modifiedCount };
    });
    return resultado;
  } finally {
    await session.endSession();
  }
};

// Rechaza una solicitud pendiente (una sola escritura => ya es atómica).
solicitudSchema.statics.rechazar = async function rechazar(id) {
  const solicitud = await this.findOneAndUpdate(
    { _id: id, estado_solicitud: 'Pendiente' },
    { estado_solicitud: 'Rechazada' },
    { new: true }
  );
  if (solicitud) return solicitud;
  const existe = await this.exists({ _id: id });
  throw existe
    ? AppError.conflict('SOLICITUD_YA_RESUELTA', 'La solicitud ya fue aprobada o rechazada')
    : AppError.notFound('SOLICITUD_NO_ENCONTRADA', 'La solicitud no existe');
};

module.exports = mongoose.model('Solicitud', solicitudSchema);
module.exports.ESTADOS = ESTADOS;
