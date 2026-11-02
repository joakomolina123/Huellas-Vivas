# Huellas Vivas

Plataforma web para la gestión y adopción de mascotas de refugios.
Proyecto del curso de Bases de Datos (Ingeniería Civil en Informática) · Etapa 2.

**Equipo:** Máximo Torrijo · Joaquín Molina · Ignacio Jorquera

## Estado del proyecto

| Parte | Estado |
|---|---|
| `backend/` API REST (Node.js + Express + MongoDB) | Lista para probar en local |
| `frontend/` aplicación web (SPA) | Pendiente |
| Despliegue en Render + MongoDB Atlas | Pendiente (URL pública: se completa al desplegar) |

## Tecnologías

Node.js · Express · MongoDB Atlas · Mongoose · JWT · bcryptjs · helmet · express-rate-limit · Render

## Estructura del repositorio

```
huellas-vivas/
├── backend/
│   ├── configuracion/   variables.js (lee el .env) · baseDeDatos.js (conexión a MongoDB)
│   ├── modelos/         Usuario · Mascota · Solicitud (cómo se guardan los datos)
│   ├── controladores/   la lógica: sesion · mascotas · usuarios · solicitudes · reportes
│   ├── rutas/           qué dirección llama a qué controlador (mismos nombres)
│   ├── seguridad/       verificarSesion · verificarRol · limitarPeticiones · validarId
│   ├── utilidades/      ErrorApp · manejoErrores · rut · validaciones · paginacion · respuestas · ocultarCampos
│   ├── datos/           cargarDatos.js (datos iniciales de ejemplo)
│   ├── aplicacion.js    configuración de Express
│   ├── servidor.js      arranque del servidor
│   ├── .env.example
│   └── package.json
├── frontend/            (próxima fase)
└── README.md
```

## Ejecutar en local

1. Requisitos: Node.js 18 o superior y una base en MongoDB Atlas (las transacciones necesitan un replica set; Atlas lo incluye).
2. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```
3. Crear el archivo `.env` copiando `.env.example` y completando `MONGODB_URI` y `JWT_SECRET`.
4. Cargar datos iniciales de ejemplo (borra y recrea usuarios, mascotas y solicitudes):
   ```bash
   npm run cargar-datos
   ```
5. Iniciar la API:
   ```bash
   npm run dev      # recarga automática
   npm start        # modo normal
   ```
6. Comprobar: abrir `http://localhost:3000/health`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto local (en Render lo asigna la plataforma) |
| `NODE_ENV` | `development` en local · `production` en Render |
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas |
| `JWT_SECRET` | Texto secreto (mín. 32 caracteres) para firmar los tokens |
| `JWT_EXPIRES_IN` | Duración de la sesión (por defecto `8h`) |
| `CORS_ORIGIN` | Dominio(s) del frontend permitidos, separados por coma |
| `CLAVE_DE_PRUEBA` | Contraseña de los usuarios de prueba de la carga de datos |

## Endpoints

Todas las respuestas exitosas tienen la forma `{ "ok": true, "mensaje"?, "data" }` y los errores
`{ "ok": false, "error": { "codigo", "mensaje", "detalles"? } }`.
Las rutas protegidas exigen la cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Requerimiento |
|---|---|---|---|
| GET | `/health` | Público | Estado del servicio |
| POST | `/api/auth/registro` | Público | RF01 |
| POST | `/api/auth/login` | Público | RF01 |
| GET | `/api/auth/perfil` | Sesión | RF01 |
| GET | `/api/mascotas?ciudad=` (+ `especie`, `tamano`, `sexo`, `esterilizado`, `page`, `limit`) | Público | RF02, RF03 |
| GET | `/api/mascotas/ciudades` | Público | RF03 |
| GET | `/api/mascotas/:id` | Público | RF02 |
| GET | `/api/mascotas/gestion` | Administrador | RF05 |
| POST | `/api/mascotas` | Administrador | RF05, RF09 |
| PUT | `/api/mascotas/:id` | Administrador | RF05, RF09 |
| PATCH | `/api/mascotas/:id/estado` | Administrador | RF05 |
| GET | `/api/usuarios` | Administrador | RF06 |
| PUT | `/api/usuarios/:id` | Administrador | RF06 |
| PATCH | `/api/usuarios/:id/estado` | Administrador | RF06 |
| POST | `/api/solicitudes` | Usuario | RF04, RF10 |
| GET | `/api/solicitudes/mias` | Usuario | RF08 |
| GET | `/api/solicitudes` | Administrador | RF07 |
| PATCH | `/api/solicitudes/:id/aprobar` | Administrador | RF07, RNF02 |
| PATCH | `/api/solicitudes/:id/rechazar` | Administrador | RF07 |
| GET | `/api/reportes/solicitudes-por-mascota` | Administrador | Consultas con `$lookup` y `$group` |
| GET | `/api/reportes/adopciones-por-ciudad` | Administrador | Consultas con `$match`, `$lookup` y `$group` |
| GET | `/api/reportes/solicitudes-detalle` | Administrador | Consultas con 2 `$lookup` y `$in` |
| GET | `/api/reportes/mascotas-por-especie` | Administrador | Consultas con `$group` y `$avg` |

## Datos de prueba (después de `npm run cargar-datos`)

- Administrador: `contacto@refugiohuellas.cl`
- Usuario: `ijorquera@gmail.com`
- Contraseña de ambos: el valor de `CLAVE_DE_PRUEBA` (por defecto `Huellas2026!`)
