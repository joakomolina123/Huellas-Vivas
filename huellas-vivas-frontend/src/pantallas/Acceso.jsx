import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../Contexto/Sesion.jsx';
import { mensajeDeError } from '../conexion/api';

const campo = { width: '100%', padding: '9px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' };

export default function Acceso() {
  const { iniciarSesion, registrar } = useSesion();
  const navigate = useNavigate();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [form, setForm] = useState({ rut: '', nombre: '', correo: '', telefono: '', contrasena: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const u = modoRegistro
        ? await registrar(form)
        : await iniciarSesion(form.correo, form.contrasena);
      navigate(u.rol === 'Administrador' ? '/admin' : '/');
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '420px', margin: '40px auto' }}>
      <h2 style={{ marginBottom: '16px' }}>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      <form onSubmit={enviar}>
        {modoRegistro && (
          <>
            <input style={campo} name="rut" placeholder="RUT (12345678-5)" value={form.rut} onChange={cambiar} required />
            <input style={campo} name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={cambiar} required />
            <input style={campo} name="telefono" placeholder="Teléfono (+56912345678)" value={form.telefono} onChange={cambiar} />
          </>
        )}
        <input style={campo} type="email" name="correo" placeholder="Correo" value={form.correo} onChange={cambiar} required />
        <input style={campo} type="password" name="contrasena" placeholder="Contraseña (mín. 8 caracteres)" value={form.contrasena} onChange={cambiar} required />
        {error && <p style={{ color: '#b91c1c', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
        <button className="btn-primary" style={{ width: '100%' }} disabled={enviando}>
          {enviando ? 'Enviando...' : modoRegistro ? 'Registrarme' : 'Entrar'}
        </button>
      </form>
      <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}
        onClick={() => { setModoRegistro(!modoRegistro); setError(''); }}>
        {modoRegistro ? 'Ya tengo cuenta' : 'No tengo cuenta: registrarme'}
      </button>
    </div>
  );
}
