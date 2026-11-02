// Límites de peticiones por IP (seguridad básica y "Límites y Cuotas" de la documentación).
const rateLimit = require('express-rate-limit');

function crearLimitador({ ventanaMinutos, maximo, codigo, mensaje }) {
  return rateLimit({
    windowMs: ventanaMinutos * 60 * 1000,
    limit: maximo,
    standardHeaders: 'draft-7', // informa el límite restante en las cabeceras RateLimit-*
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({ ok: false, error: { codigo, mensaje } }),
  });
}

// Para toda la API
const limiteGeneral = crearLimitador({
  ventanaMinutos: 15,
  maximo: 300,
  codigo: 'DEMASIADAS_PETICIONES',
  mensaje: 'Has hecho demasiadas peticiones. Intenta nuevamente en unos minutos',
});

// Más estricto para login y registro (frena intentos de adivinar contraseñas)
const limiteAutenticacion = crearLimitador({
  ventanaMinutos: 15,
  maximo: 20,
  codigo: 'DEMASIADOS_INTENTOS',
  mensaje: 'Demasiados intentos de acceso. Intenta nuevamente en 15 minutos',
});

module.exports = { limiteGeneral, limiteAutenticacion };
