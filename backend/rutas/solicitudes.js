const { Router } = require('express');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/solicitudes');

const router = Router();
router.param('id', validarId);

// Crear postulación y listar solicitudes personales
router.post('/', controlador.crear);
router.get('/mias', controlador.listarMias);

// Rutas para el Panel Refugio (listar y cambiar estado)
router.get('/', controlador.listarTodas);
router.patch('/:id/aprobar', controlador.aprobar);
router.patch('/:id/rechazar', controlador.rechazar);

module.exports = router;