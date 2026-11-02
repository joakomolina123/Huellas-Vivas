// Punto de entrada: conecta a MongoDB y recién entonces abre el puerto.
const { puerto } = require('./configuracion/variables');
const { conectarBD } = require('./configuracion/baseDeDatos');
const app = require('./aplicacion');

async function iniciar() {
  await conectarBD();
  app.listen(puerto, () => console.log(`API Huellas Vivas escuchando en el puerto ${puerto}`));
}

iniciar().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});
