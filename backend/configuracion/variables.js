// Lee y valida las variables de entorno UNA sola vez.
// El resto del código importa desde aquí y nunca usa process.env directamente.
require('dotenv').config();

const esProduccion = process.env.NODE_ENV === 'production';

// En producción (Render) CORS_ORIGIN es obligatorio; en local tiene un valor por defecto.
const obligatorias = ['MONGODB_URI', 'JWT_SECRET'];
if (esProduccion) obligatorias.push('CORS_ORIGIN');

const faltantes = obligatorias.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
  throw new Error(`Faltan variables de entorno obligatorias: ${faltantes.join(', ')}`);
}

if (esProduccion && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
}

module.exports = {
  esProduccion,
  puerto: Number(process.env.PORT) || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  // "https://mi-app.onrender.com/" y "https://mi-app.onrender.com" deben ser lo mismo
  origenesPermitidos: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim().replace(/\/$/, ''))
    .filter(Boolean),
};
