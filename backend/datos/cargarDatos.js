// Carga los datos iniciales de la base de datos.
// Uso:  npm run cargar-datos     (usa MONGODB_URI del .env: sirve igual contra Atlas)
// ATENCIÓN: BORRA usuarios, mascotas y solicitudes antes de insertar.
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('../configuracion/variables');
const { conectarBD } = require('../configuracion/baseDeDatos');
const Usuario = require('../modelos/Usuario');
const Mascota = require('../modelos/Mascota');
const Solicitud = require('../modelos/Solicitud');

const CONTRASENA = process.env.CLAVE_DE_PRUEBA || 'Huellas2026!';
const hace = (dias) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

const usuarios = [
  { rut: '15420119-K', nombre: 'Camila Contreras', correo: 'contacto@refugiohuellas.cl', telefono: '+56987654321', rol: 'Administrador' },
  { rut: '19876543-0', nombre: 'Ignacio Jorquera', correo: 'ijorquera@gmail.com', telefono: '+56991234567' },
  { rut: '20123456-5', nombre: 'Joaquín Molina', correo: 'jmolina.dev@gmail.com', telefono: '+56988776655' },
  { rut: '18345678-4', nombre: 'Valentina Silva', correo: 'vale.silva@hotmail.com', telefono: '+56977665544' },
  { rut: '12345678-5', nombre: 'Pedro Pascal', correo: 'pedro@gmail.com', telefono: '+56911112222', activo: false }, // cuenta suspendida de ejemplo
];

const mascotas = [
  { nombre: 'Milo', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 2, tamano: 'Mediano', ciudad: 'Valparaíso', esterilizado: true, foto_url: '/images/milo.jpg', descripcion: 'Rescatado cerca del puerto. Muy juguetón, sociable con niños y con sus vacunas al día.', fecha_ingreso: hace(40) },
  { nombre: 'Simba', especie: 'Gato', raza: 'Doméstico de pelo corto', sexo: 'Macho', edad_aprox: 1, tamano: 'Pequeño', ciudad: 'Viña del Mar', esterilizado: true, foto_url: '/images/simba.jpg', descripcion: 'Tranquilo, regalón y acostumbrado a vivir en departamento.', fecha_ingreso: hace(32) },
  { nombre: 'Luna', especie: 'Perro', raza: 'Quiltro mestizo', sexo: 'Hembra', edad_aprox: 3, tamano: 'Grande', ciudad: 'Valparaíso', esterilizado: true, foto_url: '/images/luna.jpg', descripcion: 'Protectora, cariñosa y llena de energía para pasear.', fecha_ingreso: hace(28) },
  { nombre: 'Mia', especie: 'Gato', raza: 'Mestizo', sexo: 'Hembra', edad_aprox: 1, tamano: 'Pequeño', ciudad: 'Quilpué', esterilizado: false, foto_url: '/images/mia.jpg', descripcion: 'Rescatada de una camada en la calle. Muy cariñosa.', fecha_ingreso: hace(10) },
  { nombre: 'Firulais', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 2, tamano: 'Mediano', ciudad: 'Valparaíso', esterilizado: true, foto_url: '/images/firulais.jpg', descripcion: 'Juguetón y cariñoso, ideal para familias con espacio para jugar.', fecha_ingreso: hace(21) },
  { nombre: 'Michi', especie: 'Gato', raza: 'Doméstico', sexo: 'Hembra', edad_aprox: 2, tamano: 'Pequeño', ciudad: 'Valparaíso', esterilizado: true, foto_url: '/images/michi.jpg', descripcion: 'Independiente y limpia. Se lleva bien con otros gatos.', fecha_ingreso: hace(15) },
  { nombre: 'Canela', especie: 'Perro', raza: 'Labrador mestiza', sexo: 'Hembra', edad_aprox: 4, tamano: 'Grande', ciudad: 'Villa Alemana', esterilizado: false, foto_url: '/images/canela.jpg', descripcion: 'Dócil y obediente. Necesita patio o paseos largos.', fecha_ingreso: hace(7) },
  { nombre: 'Pelusa', especie: 'Conejo', raza: 'Enano', sexo: 'Hembra', edad_aprox: 1, tamano: 'Pequeño', ciudad: 'Quilpué', esterilizado: false, foto_url: '/images/pelusa.jpg', descripcion: 'Tranquila. Requiere jaula amplia y heno fresco.', fecha_ingreso: hace(5) },
  { nombre: 'Rocky', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 3, tamano: 'Grande', ciudad: 'Valparaíso', esterilizado: true, foto_url: '/images/rocky.jpg', estado: 'Adoptada', descripcion: 'Amigable y juguetón.', fecha_ingreso: hace(60) },
  { nombre: 'Cachupín', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 1, tamano: 'Pequeño', ciudad: 'Viña del Mar', esterilizado: true, foto_url: '/images/cachupin.jpg', estado: 'Adoptada', descripcion: 'Cachorrón y juguetón.', fecha_ingreso: hace(50) },
];

// [correo del usuario, nombre de la mascota, estado, hace cuántos días]
const solicitudes = [
  ['ijorquera@gmail.com', 'Luna', 'Pendiente', 6],
  ['jmolina.dev@gmail.com', 'Luna', 'Pendiente', 4],   // 2 pendientes para Luna: sirven para demostrar la aprobación
  ['vale.silva@hotmail.com', 'Milo', 'Pendiente', 3],
  ['jmolina.dev@gmail.com', 'Simba', 'Pendiente', 2],
  ['vale.silva@hotmail.com', 'Simba', 'Pendiente', 1],
  ['vale.silva@hotmail.com', 'Rocky', 'Aprobada', 55],
  ['jmolina.dev@gmail.com', 'Rocky', 'Rechazada', 56],
  ['ijorquera@gmail.com', 'Cachupín', 'Aprobada', 45],
];

async function sembrar() {
  await conectarBD();
  console.log(`Base: ${mongoose.connection.name}. Borrando datos anteriores...`);

  // Los índices (incluidos los únicos parciales) deben existir antes de insertar.
  await Promise.all([Usuario.syncIndexes(), Mascota.syncIndexes(), Solicitud.syncIndexes()]);
  await Promise.all([Usuario.deleteMany({}), Mascota.deleteMany({}), Solicitud.deleteMany({})]);

  const hash = await bcrypt.hash(CONTRASENA, 10);
  const usuariosCreados = await Usuario.create(usuarios.map((u) => ({ ...u, contrasena: hash })));
  const mascotasCreadas = await Mascota.create(mascotas);

  const porCorreo = Object.fromEntries(usuariosCreados.map((u) => [u.correo, u]));
  const porNombre = Object.fromEntries(mascotasCreadas.map((m) => [m.nombre, m]));
  await Solicitud.create(
    solicitudes.map(([correo, nombre, estado, dias]) => ({
      usuario: porCorreo[correo]._id,
      mascota: porNombre[nombre]._id,
      usuario_nombre: porCorreo[correo].nombre,
      mascota_nombre: porNombre[nombre].nombre,
      estado_solicitud: estado,
      fecha_solicitud: hace(dias),
    }))
  );

  console.log(`Listo: ${usuarios.length} usuarios, ${mascotas.length} mascotas, ${solicitudes.length} solicitudes.`);
  console.log(`Administrador: contacto@refugiohuellas.cl | Usuario: ijorquera@gmail.com | Contraseña: ${CONTRASENA}`);
}

sembrar()
  .catch((error) => {
    console.error('Error con la carga de datos:', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
