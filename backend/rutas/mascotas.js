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

// Solo Administrador
router.get('/gestion', autenticar, autorizar('Administrador'), controlador.listarGestion);

router.get('/:id', controlador.obtener);
router.post('/', autenticar, autorizar('Administrador'), controlador.crear);
router.put('/:id', autenticar, autorizar('Administrador'), controlador.actualizar);
router.patch('/:id/estado', autenticar, autorizar('Administrador'), controlador.cambiarEstado);

module.exports = router;
