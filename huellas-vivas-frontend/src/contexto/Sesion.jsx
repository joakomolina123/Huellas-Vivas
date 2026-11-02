import { createContext, useContext, useEffect, useState } from 'react';
import api from '../conexion/api';

const SesionContext = createContext(null);
export const useSesion = () => useContext(SesionContext);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al recargar la página, recupera la sesión con el token guardado
  useEffect(() => {
    if (!localStorage.getItem('token')) { setCargando(false); return; }
    api.get('/auth/perfil')
      .then((res) => setUsuario(res.data.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setCargando(false));
  }, []);

  const guardarSesion = ({ token, usuario }) => {
    localStorage.setItem('token', token);
    setUsuario(usuario);
  };

  const iniciarSesion = async (correo, contrasena) => {
    const res = await api.post('/auth/login', { correo, contrasena });
    guardarSesion(res.data.data);
    return res.data.data.usuario;
  };

  const registrar = async (datos) => {
    const res = await api.post('/auth/registro', datos);
    guardarSesion(res.data.data);
    return res.data.data.usuario;
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <SesionContext.Provider value={{ usuario, cargando, iniciarSesion, registrar, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  );
}
