// Configura Express (seguridad, CORS, rutas y errores). No abre el puerto: eso lo hace servidor.js.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { origenesPermitidos } = require('./configuracion/variables');
const AppError = require('./utilidades/ErrorApp');
const { limiteGeneral } = require('./seguridad/limitarPeticiones');
const { rutaNoEncontrada, manejarErrores } = require('./utilidades/manejoErrores');
const rutas = require('./rutas');

const app = express();

// Render pone un proxy delante: sin esto el límite de peticiones vería siempre la misma IP.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origen, callback) {
      // Sin "origin" = Postman, curl o el health check de Render
      if (!origen || origenesPermitidos.includes(origen)) return callback(null, true);
      return callback(AppError.forbidden('ORIGEN_NO_PERMITIDO', 'Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' }));

// Health check (Render lo usa para saber si el servicio está vivo)
app.get('/health', (req, res) => {
  const conectada = mongoose.connection.readyState === 1;
  res.status(conectada ? 200 : 503).json({
    ok: conectada,
    servicio: 'huellas-vivas-api',
    baseDeDatos: conectada ? 'conectada' : 'desconectada',
    hora: new Date().toISOString(),
  });
});

app.use('/api', limiteGeneral, rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
