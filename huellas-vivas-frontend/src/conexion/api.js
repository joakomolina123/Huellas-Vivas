import axios from 'axios';

// Cambiamos a la raíz sin '/api' al final
const API_URL = import.meta.env.VITE_API_URL || 'https://huellas-vivas-api.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;