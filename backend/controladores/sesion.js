// RF01: registro e inicio de sesión. El rol NUNCA se recibe desde el cliente:
// toda cuenta nueva es "Usuario" (los administradores se crean con la carga de datos).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../configuracion/variables');
const Usuario = require('../modelos/Usuario');
const AppError = require('../utilidades/ErrorApp');
const { enviarOk } = require('../utilidades/respuestas');
const { seleccionar, exigirTexto } = require('../utilidades/validaciones');

const RONDAS_BCRYPT = 10;
const LARGO_MINIMO_CONTRASENA = 8;

function generarToken(usuario) {
  return jwt.sign({ sub: usuario.id, rol: usuario.rol }, jwtSecret, { expiresIn: jwtExpiresIn });
}

// POST /api/auth/registro
async function registrar(req, res) {
  const datos = seleccionar(req.body, ['rut', 'nombre', 'correo', 'telefono']);
  const contrasena = exigirTexto(req.body?.contrasena, 'contrasena', { recortar: false });
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
    throw AppError.badRequest('DATOS_INVALIDOS', 'La contraseña debe tener al menos 8 caracteres', [
      { campo: 'contrasena', mensaje: 'Mínimo 8 caracteres' },
    ]);
  }

  const usuario = await Usuario.create({
    ...datos,
    contrasena: await bcrypt.hash(contrasena, RONDAS_BCRYPT), // RNF03
  });
  enviarOk(res, 201, { token: generarToken(usuario), usuario }, 'Cuenta creada correctamente');
}

// POST /api/auth/login
async function iniciarSesion(req, res) {
  const correo = exigirTexto(req.body?.correo, 'correo').toLowerCase();
  const contrasena = exigirTexto(req.body?.contrasena, 'contrasena', { recortar: false });

  const usuario = await Usuario.findOne({ correo }).select('+contrasena');
  const coincide = usuario && (await bcrypt.compare(contrasena, usuario.contrasena));
  // Mismo mensaje si falla el correo o la clave: no revela cuál de los dos está mal.
  if (!coincide) throw AppError.unauthorized('CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos');
  if (!usuario.activo) {
    throw AppError.forbidden('USUARIO_SUSPENDIDO', 'Tu cuenta está suspendida. Contacta al refugio');
  }

  enviarOk(res, 200, { token: generarToken(usuario), usuario }, 'Sesión iniciada');
}

// GET /api/auth/perfil  (el frontend lo usa para recuperar la sesión al recargar)
async function perfil(req, res) {
  enviarOk(res, 200, req.usuario);
}

module.exports = { registrar, iniciarSesion, perfil };
