const { Router } = require('express');
const autenticar = require('../seguridad/verificarSesion');
const autorizar = require('../seguridad/verificarRol');
const controlador = require('../controladores/reportes');

const router = Router();

router.use(autenticar, autorizar('Administrador'));

router.get('/solicitudes-por-mascota', controlador.solicitudesPorMascota);
router.get('/adopciones-por-ciudad', controlador.adopcionesPorCiudad);
router.get('/solicitudes-detalle', controlador.solicitudesDetalle);
router.get('/mascotas-por-especie', controlador.mascotasPorEspecie);

module.exports = router;
