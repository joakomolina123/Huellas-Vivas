const { Router } = require('express');
const autenticar = require('../seguridad/verificarSesion');
const autorizar = require('../seguridad/verificarRol');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/mascotas');

const router = Router();
router.param('id', validarId);

// Públicas. OJO: /ciudades y /gestion van ANTES de /:id para que no se confundan con un id.
router.get('/', controlador.listarCatalogo);
router.get('/ciudades', controlador.listarCiudades);
router.get('/gestion', controlador.listarGestion); // Removido autenticar y autorizar

router.get('/:id', controlador.obtener);

// Se remueven 'autenticar' y 'autorizar' para habilitar el registro desde el Panel Refugio
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.patch('/:id/estado', controlador.cambiarEstado);

module.exports = router;