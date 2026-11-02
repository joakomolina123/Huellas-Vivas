// Colección "mascotas". Las fechas del RF09 las maneja Mongoose automáticamente:
// fecha_ingreso (al crear) y fecha_modificacion (en cada edición).
const mongoose = require('mongoose');
const limpiarJson = require('../utilidades/ocultarCampos');

const ESTADOS = ['Disponible', 'Adoptada'];

const mascotaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 50 },
    especie: { type: String, required: [true, 'La especie es obligatoria'], trim: true, maxlength: 20 },
    raza: { type: String, trim: true, maxlength: 50, default: null },
    sexo: {
      type: String,
      required: [true, 'El sexo es obligatorio'],
      enum: { values: ['Macho', 'Hembra'], message: 'El sexo debe ser Macho o Hembra' },
    },
    edad_aprox: { type: Number, min: [0, 'La edad no puede ser negativa'], max: [40, 'Edad no válida'], default: null },
    tamano: {
      type: String,
      enum: { values: ['Pequeño', 'Mediano', 'Grande'], message: 'El tamaño debe ser Pequeño, Mediano o Grande' },
      default: null,
    },
    ciudad: { type: String, required: [true, 'La ciudad es obligatoria'], trim: true, maxlength: 50 },
    esterilizado: { type: Boolean, default: false },
    foto_url: { type: String, trim: true, maxlength: 255, default: null },
    estado: {
      type: String,
      enum: { values: ESTADOS, message: 'El estado debe ser Disponible o Adoptada' },
      default: 'Disponible',
    },
    descripcion: { type: String, trim: true, maxlength: 1000, default: null },
  },
  {
    collection: 'mascotas',
    timestamps: { createdAt: 'fecha_ingreso', updatedAt: 'fecha_modificacion' },
    toJSON: { transform: limpiarJson },
  }
);

// Índice pensado para el catálogo (filtros obligatorios + orden por fecha) => RNF01
mascotaSchema.index({ estado: 1, ciudad: 1, fecha_ingreso: -1 });

module.exports = mongoose.model('Mascota', mascotaSchema);
module.exports.ESTADOS = ESTADOS;
