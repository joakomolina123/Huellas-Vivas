// Conexión a MongoDB (Atlas) con Mongoose.
const mongoose = require('mongoose');
const { mongodbUri } = require('./variables');

async function conectarBD() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Conectado a MongoDB (base: ${mongoose.connection.name})`);
}

module.exports = { conectarBD };
