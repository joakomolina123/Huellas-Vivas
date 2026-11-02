const { Router } = require('express');
const autenticar = require('../seguridad/verificarSesion');
const autorizar = require('../seguridad/verificarRol');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/solicitudes');
 
const router = Router();
router.param('id', validarId);
 
// Todas requieren sesión iniciada
router.use(autenticar);
 
// Usuario: postular y ver su historial (RF04, RF08, RF10)
router.post('/', autorizar('Usuario'), controlador.crear);
router.get('/mias', autorizar('Usuario'), controlador.listarMias);
 
// Administrador: revisar, aprobar y rechazar (RF07)
router.get('/', autorizar('Administrador'), controlador.listarTodas);
router.patch('/:id/aprobar', autorizar('Administrador'), controlador.aprobar);
router.patch('/:id/rechazar', autorizar('Administrador'), controlador.rechazar);
 
module.exports = router;
 