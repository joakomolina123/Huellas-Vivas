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

// Configuración de CORS permitiendo Vercel, localhost y clientes externos
app.use(
  cors({
    origin(origen, callback) {
      // Si no hay origen (Postman, curl, Render health check) o si se encuentra en la lista permitida, se autoriza
      if (!origen || origenesPermitidos.includes(origen) || origen.includes('vercel.app')) {
        return callback(null, true);
      }
      // Permitir de forma permisiva en desarrollo/despliegues de producción dinámicos
      return callback(null, true);
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

// Soporte para rutas montadas con /api y también en la raíz para compatibilidad directa
app.use('/api', limiteGeneral, rutas);
app.use('/', limiteGeneral, rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;