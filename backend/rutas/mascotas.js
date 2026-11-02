const { Router } = require('express');
const autenticar = require('../seguridad/verificarSesion');
const autorizar = require('../seguridad/verificarRol');
const validarId = require('../seguridad/validarId');
const controlador = require('../controladores/mascotas');
 
const router = Router();
router.param('id', validarId);
 
// Públicas: cualquiera puede ver el catálogo (RF02, RF03)
router.get('/', controlador.listarCatalogo);
router.get('/ciudades', controlador.listarCiudades);
 
// Solo Administrador (RF05). "/gestion" va antes de "/:id" para que no se confunda con un id.
router.get('/gestion', autenticar, autorizar('Administrador'), controlador.listarGestion);
router.post('/', autenticar, autorizar('Administrador'), controlador.crear);
router.put('/:id', autenticar, autorizar('Administrador'), controlador.actualizar);
router.patch('/:id/estado', autenticar, autorizar('Administrador'), controlador.cambiarEstado);
 
router.get('/:id', controlador.obtener);
 
module.exports = router;
 