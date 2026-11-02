const { Router } = require('express');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/mascotas');

const router = Router();
router.param('id', validarId);

// Rutas de consulta del catálogo y gestión (públicas para demo)
router.get('/', controlador.listarCatalogo);
router.get('/ciudades', controlador.listarCiudades);
router.get('/gestion', controlador.listarGestion);

router.get('/:id', controlador.obtener);

// Rutas de escritura (públicas para registro desde Panel Refugio)
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.patch('/:id/estado', controlador.cambiarEstado);

module.exports = router;