import React, { useState, useEffect } from 'react';
import api from '../conexion/api';

export default function PanelAdmin() {
  const [tab, setTab] = useState('mascotas');
  const [mascotas, setMascotas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [modalMascota, setModalMascota] = useState(false);
  const [errorMsj, setErrorMsj] = useState('');

  const [formMascota, setFormMascota] = useState({
    nombre: '',
    especie: 'Perro',
    raza: 'Mestizo',
    sexo: 'Macho',
    edad_aprox: 1,
    tamano: 'Mediano',
    ciudad: 'Valparaíso',
    estado: 'Disponible',
    descripcion: '',
    esterilizado: false
  });

  const cargarDatos = async () => {
    try {
      const resM = await api.get('/mascotas');
      const datosM = resM.data;
      const listaMascotas = Array.isArray(datosM)
        ? datosM
        : (datosM?.mascotas || datosM?.datos || []);
      setMascotas(listaMascotas);
    } catch (err) {
      console.error('Error al cargar mascotas en el panel:', err);
      setMascotas([]);
    }

    try {
      const resS = await api.get('/solicitudes');
      const datosS = resS.data;
      const listaSolicitudes = Array.isArray(datosS)
        ? datosS
        : (datosS?.solicitudes || datosS?.datos || []);
      setSolicitudes(listaSolicitudes);
    } catch (err) {
      console.warn('No se pudieron obtener solicitudes:', err);
      setSolicitudes([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardarMascota = async (e) => {
    e.preventDefault();
    setErrorMsj('');

    try {
      const payload = {
        nombre: String(formMascota.nombre || '').trim(),
        especie: String(formMascota.especie || 'Perro'),
        raza: String(formMascota.raza || 'Mestizo'),
        sexo: String(formMascota.sexo || 'Macho'),
        edad_aprox: Number(formMascota.edad_aprox) || 1,
        tamano: String(formMascota.tamano || 'Mediano'),
        ciudad: String(formMascota.ciudad || 'Valparaíso'),
        estado: String(formMascota.estado || 'Disponible'),
        descripcion: String(formMascota.descripcion || 'Sin descripción'),
        esterilizado: Boolean(formMascota.esterilizado)
      };

      await api.post('/mascotas', payload);
      alert('¡Mascota creada exitosamente!');
      setModalMascota(false);
      setFormMascota({
        nombre: '', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 1, tamano: 'Mediano', ciudad: 'Valparaíso', estado: 'Disponible', descripcion: '', esterilizado: false
      });
      cargarDatos();
    } catch (err) {
      console.error('Detalle error POST /mascotas:', err.response?.data);

      let textoError = 'No se pudo guardar la mascota';
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d === 'string') textoError = d;
        else if (typeof d.mensaje === 'string') textoError = d.mensaje;
        else if (typeof d.error === 'string') textoError = d.error;
        else if (typeof d.message === 'string') textoError = d.message;
        else textoError = JSON.stringify(d);
      } else if (err.message) {
        textoError = err.message;
      }

      setErrorMsj(String(textoError));
    }
  };

  const cambiarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      await api.patch(`/solicitudes/${id}`, { estado_solicitud: nuevoEstado });
      cargarDatos();
    } catch (err) {
      alert('Error al actualizar la solicitud');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Menú Lateral */}
        <div style={{ width: '220px' }}>
          <button 
            onClick={() => setTab('mascotas')}
            style={{ width: '100%', padding: '12px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', background: tab === 'mascotas' ? '#dbeafe' : '#fff', color: tab === 'mascotas' ? '#1d4ed8' : '#64748b', fontWeight: '600', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            Mascotas ({Array.isArray(mascotas) ? mascotas.length : 0})
          </button>
          <button 
            onClick={() => setTab('solicitudes')}
            style={{ width: '100%', padding: '12px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', background: tab === 'solicitudes' ? '#dbeafe' : '#fff', color: tab === 'solicitudes' ? '#1d4ed8' : '#64748b', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            Solicitudes <span className="badge badge-pendiente">{Array.isArray(solicitudes) ? solicitudes.length : 0}</span>
          </button>
        </div>

        {/* Panel Central */}
        <div style={{ flex: 1 }}>
          {tab === 'mascotas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', color: '#1e293b' }}>Mascotas</h2>
                <button className="btn-primary" onClick={() => { setErrorMsj(''); setModalMascota(true); }}>+ Nueva mascota</button>
              </div>

              <div className="card">
                {!Array.isArray(mascotas) || mascotas.length === 0 ? (
                  <p style={{ color: '#64748b', padding: '10px 0' }}>No hay mascotas registradas. Haz clic en <strong>+ Nueva mascota</strong> para crear una.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px' }}>
                        <th style={{ padding: '10px' }}>NOMBRE</th>
                        <th style={{ padding: '10px' }}>ESPECIE</th>
                        <th style={{ padding: '10px' }}>CIUDAD</th>
                        <th style={{ padding: '10px' }}>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mascotas.map((m, index) => (
                        <tr key={m._id || m.id_mascota || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: '600' }}>{m.nombre || 'Sin nombre'}</td>
                          <td style={{ padding: '10px' }}>{m.especie || 'Perro'}</td>
                          <td style={{ padding: '10px' }}>{m.ciudad || 'Valparaíso'}</td>
                          <td style={{ padding: '10px' }}>
                            <span className="badge badge-disponible">{m.estado || 'Disponible'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === 'solicitudes' && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#1e293b' }}>Solicitudes de adopción</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                {!Array.isArray(solicitudes) || solicitudes.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No hay solicitudes registradas.</p>
                ) : (
                  solicitudes.map((s, idx) => (
                    <div key={s._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <strong>{s.id_mascota?.nombre || 'Mascota'}</strong>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Postulante: {s.nombre_postulante || 'Usuario'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => cambiarEstadoSolicitud(s._id, 'Aprobada')}>Aprobar</button>
                        <button className="btn-danger" onClick={() => cambiarEstadoSolicitud(s._id, 'Rechazada')}>Rechazar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalMascota && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ marginBottom: '14px' }}>Nueva Mascota</h3>

            {Boolean(errorMsj) && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {String(errorMsj)}
              </div>
            )}

            <form onSubmit={handleGuardarMascota} style={{ display: 'grid', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre</label>
                <input type="text" required value={formMascota.nombre} onChange={e => setFormMascota({...formMascota, nombre: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Especie</label>
                  <select value={formMascota.especie} onChange={e => setFormMascota({...formMascota, especie: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tamaño</label>
                  <select value={formMascota.tamano} onChange={e => setFormMascota({...formMascota, tamano: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Sexo</label>
                  <select value={formMascota.sexo} onChange={e => setFormMascota({...formMascota, sexo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Ciudad</label>
                  <select value={formMascota.ciudad} onChange={e => setFormMascota({...formMascota, ciudad: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Viña del Mar">Viña del Mar</option>
                    <option value="Santiago">Santiago</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Descripción</label>
                <textarea rows="2" value={formMascota.descripcion} onChange={e => setFormMascota({...formMascota, descripcion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

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