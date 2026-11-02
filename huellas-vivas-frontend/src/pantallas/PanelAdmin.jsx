import React, { useState, useEffect } from 'react';
import api from '../conexion/api';

export default function PanelAdmin() {
  const [tab, setTab] = useState('mascotas'); // 'mascotas' | 'solicitudes'
  const [mascotas, setMascotas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [modalMascota, setModalMascota] = useState(false);
  const [formMascota, setFormMascota] = useState({
    nombre: '', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 1, tamano: 'Mediano', ciudad: 'Valparaíso', estado: 'Disponible', descripcion: '', esterilizado: false
  });

  const cargarDatos = async () => {
    try {
      const resM = await api.get('/mascotas');
      setMascotas(Array.isArray(resM.data) ? resM.data : (resM.data.datos || []));

      const resS = await api.get('/solicitudes');
      setSolicitudes(Array.isArray(resS.data) ? resS.data : (resS.data.datos || []));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleGuardarMascota = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mascotas', formMascota);
      alert('Mascota guardada con éxito');
      setModalMascota(false);
      cargarDatos();
    } catch (err) {
      alert('Error al guardar mascota');
    }
  };

  const cambiarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      await api.patch(`/solicitudes/${id}`, { estado_solicitud: nuevoEstado });
      cargarDatos();
    } catch (err) {
      alert('Error al actualizar solicitud');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Menú lateral */}
        <div style={{ width: '200px' }}>
          <button 
            onClick={() => setTab('solicitudes')}
            style={{ width: '100%', padding: '10px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', background: tab === 'solicitudes' ? '#dbeafe' : 'transparent', color: tab === 'solicitudes' ? '#1d4ed8' : '#64748b', fontWeight: '600', cursor: 'pointer', marginBottom: '8px' }}
          >
            Solicitudes <span className="badge badge-pendiente">{solicitudes.length}</span>
          </button>
          <button 
            onClick={() => setTab('mascotas')}
            style={{ width: '100%', padding: '10px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', background: tab === 'mascotas' ? '#dbeafe' : 'transparent', color: tab === 'mascotas' ? '#1d4ed8' : '#64748b', fontWeight: '600', cursor: 'pointer' }}
          >
            Mascotas
          </button>
        </div>

        {/* Contenido Principal */}
        <div style={{ flex: 1 }}>
          {tab === 'mascotas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Mascotas</h2>
                <button className="btn-primary" onClick={() => setModalMascota(true)}>+ Nueva mascota</button>
              </div>

              <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      <th style={{ padding: '12px' }}>NOMBRE</th>
                      <th style={{ padding: '12px' }}>ESPECIE</th>
                      <th style={{ padding: '12px' }}>CIUDAD</th>
                      <th style={{ padding: '12px' }}>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mascotas.map((m) => (
                      <tr key={m._id || m.id_mascota} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{m.nombre}</td>
                        <td style={{ padding: '12px' }}>{m.especie}</td>
                        <td style={{ padding: '12px' }}>{m.ciudad}</td>
                        <td style={{ padding: '12px' }}><span className={`badge badge-${(m.estado || 'disponible').toLowerCase()}`}>{m.estado || 'Disponible'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'solicitudes' && (
            <div>
              <h2>Solicitudes de adopción</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                {solicitudes.map((s) => (
                  <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <strong>{s.id_mascota?.nombre || 'Mascota'}</strong>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>Estado: {s.estado_solicitud || 'Pendiente'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-primary" onClick={() => cambiarEstadoSolicitud(s._id, 'Aprobada')}>Aprobar</button>
                      <button className="btn-danger" onClick={() => cambiarEstadoSolicitud(s._id, 'Rechazada')}>Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear Mascota */}
      {modalMascota && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Nueva Mascota</h3>
            <form onSubmit={handleGuardarMascota} style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
              <input type="text" placeholder="Nombre" required value={formMascota.nombre} onChange={e => setFormMascota({...formMascota, nombre: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <select value={formMascota.especie} onChange={e => setFormMascota({...formMascota, especie: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
              <textarea placeholder="Descripción" value={formMascota.descripcion} onChange={e => setFormMascota({...formMascota, descripcion: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalMascota(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}