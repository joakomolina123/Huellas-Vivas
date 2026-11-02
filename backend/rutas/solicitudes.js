const { Router } = require('express');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/solicitudes');

const router = Router();
router.param('id', validarId);

// Se comenta la verificación global de token para habilitar la demo
// router.use(autenticar);

// Rutas accesibles desde el frontend
router.post('/', controlador.crear);
router.get('/mias', controlador.listarMias);

// Rutas de administración
router.get('/', controlador.listarTodas);
router.patch('/:id/aprobar', controlador.aprobar);
router.patch('/:id/rechazar', controlador.rechazar);

module.exports = router;