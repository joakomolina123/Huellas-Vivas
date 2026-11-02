import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../conexion/api';

export default function FichaMascota() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mascota, setMascota] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [yaPostulado, setYaPostulado] = useState(false);

  useEffect(() => {
    api.get(`/mascotas/${id}`)
      .then((res) => setMascota(res.data.datos || res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleConfirmarAdopcion = async () => {
    try {
      await api.post('/solicitudes', { id_mascota: id });
      alert('¡Solicitud enviada con éxito!');
      setShowModal(false);
      setYaPostulado(true);
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al enviar la solicitud');
    }
  };

  if (!mascota) return <div className="container">Cargando...</div>;

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '30px' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '16px' }}>&larr; Volver</button>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px', background: '#fff' }}>
        <div style={{ height: '220px', background: '#dce8f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {mascota.foto_url ? <img src={mascota.foto_url} alt={mascota.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <span style={{ fontSize: '36px' }}>🐾</span>}
        </div>
        
        <h2>{mascota.nombre}</h2>
        <p style={{ color: '#555', fontSize: '14px' }}>
          {mascota.especie} · {mascota.tamano || 'Mediano'} · {mascota.edad_aprox || '2'} años · {mascota.ciudad}
        </p>
        <p style={{ margin: '16px 0 24px', lineHeight: '1.5' }}>
          {mascota.descripcion || 'Juguetón y cariñoso, ideal para familias con espacio para jugar.'}
        </p>

        <button 
          className="btn-primary" 
          onClick={() => setShowModal(true)} 
          disabled={yaPostulado || mascota.estado !== 'Disponible'}
        >
          {yaPostulado ? 'Solicitud Pendiente' : 'Solicitar adopción'}
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p style={{ color: '#777', fontSize: '12px', margin: '0' }}>Modal de confirmación</p>
            <h3 style={{ marginTop: '4px' }}>Confirmar solicitud</h3>
            <p>¿Deseas solicitar la adopción de <strong>{mascota.nombre}</strong>?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmarAdopcion}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}