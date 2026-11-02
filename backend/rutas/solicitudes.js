const { Router } = require('express');
const autenticar = require('../seguridad/verificarSesion');
const autorizar = require('../seguridad/verificarRol');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/solicitudes');

const router = Router();
router.param('id', validarId);

router.use(autenticar); // todo requiere sesión

// Usuario
router.post('/', autorizar('Usuario'), controlador.crear);
router.get('/mias', autorizar('Usuario'), controlador.listarMias);

// Administrador
router.get('/', autorizar('Administrador'), controlador.listarTodas);
router.patch('/:id/aprobar', autorizar('Administrador'), controlador.aprobar);
router.patch('/:id/rechazar', autorizar('Administrador'), controlador.rechazar);

module.exports = router;
