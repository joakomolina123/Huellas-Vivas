const { Router } = require('express');
const autenticar = require('../seguridad/verificarSesion');
const { limiteAutenticacion } = require('../seguridad/limitarPeticiones');
const controlador = require('../controladores/sesion');

const router = Router();

router.post('/registro', limiteAutenticacion, controlador.registrar);
router.post('/login', limiteAutenticacion, controlador.iniciarSesion);
router.get('/perfil', autenticar, controlador.perfil);

module.exports = router;
