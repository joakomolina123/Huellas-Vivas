// Punto único donde se montan todas las rutas de la API bajo /api
const { Router } = require('express');

const router = Router();

router.use('/auth', require('./sesion'));
router.use('/mascotas', require('./mascotas'));
router.use('/usuarios', require('./usuarios'));
router.use('/solicitudes', require('./solicitudes'));
router.use('/reportes', require('./reportes'));

module.exports = router;
