import axios from 'axios';

// En local la API corre en el puerto 3000. Al desplegar, define VITE_API_URL (ej: https://mi-api.onrender.com/api)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });

// Adjunta el token de sesión en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Saca el mensaje de error que manda el backend: { ok:false, error:{ mensaje, detalles } }
export function mensajeDeError(err) {
  const error = err.response?.data?.error;
  if (error) {
    const detalles = (error.detalles || []).map((d) => d.mensaje).join(', ');
    return detalles ? `${error.mensaje} (${detalles})` : error.mensaje;
  }
  if (err.code === 'ERR_NETWORK') return 'No hay conexión con el servidor. ¿Está encendido el backend?';
  return 'Ocurrió un error inesperado';
}

export default api;