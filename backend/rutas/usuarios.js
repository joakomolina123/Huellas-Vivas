const { Router } = require('express');
const autenticar = require('../seguridad/verificarSesion');
const autorizar = require('../seguridad/verificarRol');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/usuarios');

const router = Router();
router.param('id', validarId);

// Todo este módulo es solo para Administrador
router.use(autenticar, autorizar('Administrador'));

router.get('/', controlador.listar);
router.put('/:id', controlador.actualizar);
router.patch('/:id/estado', controlador.cambiarEstado);

module.exports = router;
