import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { mensajeDeError } from '../conexion/api';
import { useSesion } from '../Contexto/Sesion.jsx';

export default function FichaMascota() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useSesion();
  const [mascota, setMascota] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [yaPostulado, setYaPostulado] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'ok' | 'error', texto }

  useEffect(() => {
    api.get(`/mascotas/${id}`)
      .then((res) => setMascota(res.data.data))
      .catch((err) => setAviso({ tipo: 'error', texto: mensajeDeError(err) }));
  }, [id]);

  // RF10: si ya tiene una solicitud pendiente para esta mascota, el botón queda deshabilitado
  useEffect(() => {
    if (usuario?.rol !== 'Usuario') return;
    api.get('/solicitudes/mias').then((res) => {
      setYaPostulado(res.data.data.some((s) => s.mascota?.id === id && s.estado_solicitud === 'Pendiente'));
    }).catch(() => {});
  }, [usuario, id]);

  const confirmar = async () => {
    try {
      await api.post('/solicitudes', { mascota: id });
      setYaPostulado(true);
      setAviso({ tipo: 'ok', texto: '¡Solicitud enviada! Puedes ver su estado en "Mis solicitudes".' });
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeDeError(err) });
    } finally {
      setMostrarModal(false);
    }
  };

  const postular = () => (usuario ? setMostrarModal(true) : navigate('/acceso'));

  if (!mascota) return <p style={{ padding: 24 }}>{aviso?.texto || 'Cargando...'}</p>;

  const esAdmin = usuario?.rol === 'Administrador';
  const foto = mascota.foto_url && (mascota.foto_url.startsWith('data:image') || mascota.foto_url.startsWith('http'));

  return (
    <div style={{ maxWidth: 500, margin: '30px auto', padding: '0 20px' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: 16 }}>&larr; Volver</button>
      <div className="card">
        <div style={{ height: 220, background: '#dce8f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {foto ? <img src={mascota.foto_url} alt={mascota.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 48 }}>🐾</span>}
        </div>
        <h2 style={{ marginTop: 12 }}>{mascota.nombre}</h2>
        <p style={{ color: '#555', fontSize: 14 }}>
          {mascota.especie} · {mascota.sexo} · {mascota.tamano || 'Tamaño no indicado'} · {mascota.edad_aprox ?? '?'} años · {mascota.ciudad}
          {mascota.esterilizado ? ' · Esterilizado' : ''}
        </p>
        <p style={{ margin: '16px 0 24px', lineHeight: 1.5 }}>{mascota.descripcion || 'Sin descripción.'}</p>

        {aviso && (
          <p style={{ marginBottom: 12, padding: 10, borderRadius: 8, fontSize: 14,
            background: aviso.tipo === 'ok' ? '#dcfce7' : '#fee2e2', color: aviso.tipo === 'ok' ? '#15803d' : '#b91c1c' }}>
            {aviso.texto}
          </p>
        )}

        {!esAdmin && (
          <button className="btn-primary" style={{ width: '100%' }} onClick={postular}
            disabled={yaPostulado || mascota.estado !== 'Disponible'}>
            {mascota.estado !== 'Disponible' ? 'Ya fue adoptada' : yaPostulado ? 'Solicitud pendiente' : 'Solicitar adopción'}
          </button>
        )}
      </div>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Confirmar solicitud</h3>
            <p style={{ margin: '12px 0' }}>¿Deseas solicitar la adopción de <strong>{mascota.nombre}</strong>?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setMostrarModal(false)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={confirmar}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
