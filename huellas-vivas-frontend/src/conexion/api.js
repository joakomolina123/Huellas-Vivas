import axios from 'axios';

// URL real de tu backend en Render
const API_URL = import.meta.env.VITE_API_URL || 'https://huellas-vivas-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adjuntar token si el usuario inició sesión
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;