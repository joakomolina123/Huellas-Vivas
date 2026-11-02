// Colección "usuarios". El ROL va EMBEBIDO como campo (antes era la tabla ROL + FK):
// solo hay dos valores fijos y siempre se necesitan junto al usuario.
const mongoose = require('mongoose');
const limpiarJson = require('../utilidades/ocultarCampos');
const { normalizarRut, validarRut } = require('../utilidades/rut');

const ROLES = ['Usuario', 'Administrador'];

const usuarioSchema = new mongoose.Schema(
  {
    rut: {
      type: String,
      required: [true, 'El RUT es obligatorio'],
      unique: true,
      trim: true,
      set: (valor) => normalizarRut(valor) || valor, // se guarda como 12345678-5
      validate: { validator: validarRut, message: 'El RUT no es válido' },
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre es muy corto'],
      maxlength: [100, 'El nombre es muy largo'],
    },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no tiene un formato válido'],
    },
    // Guarda el hash de bcrypt (RNF03). select:false => nunca sale en las consultas normales.
    contrasena: { type: String, required: true, select: false },
    telefono: {
      type: String,
      trim: true,
      default: null,
      match: [/^\+?[0-9 ]{7,15}$/, 'El teléfono no tiene un formato válido'],
    },
    activo: { type: Boolean, default: true }, // desactivación lógica (RF06)
    rol: { type: String, enum: { values: ROLES, message: 'Rol no válido' }, default: 'Usuario' },
  },
  {
    collection: 'usuarios',
    timestamps: { createdAt: 'fecha_registro', updatedAt: 'fecha_modificacion' },
    toJSON: { transform: limpiarJson },
  }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
module.exports.ROLES = ROLES;
