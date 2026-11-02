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
    esterilizado: false,
    foto_url: ''
  });

  const cargarDatos = async () => {
    try {
      const resM = await api.get('/mascotas');
      const datosM = resM.data;
      const listaMascotas = Array.isArray(datosM) ? datosM : (datosM?.mascotas || datosM?.datos || []);
      setMascotas(listaMascotas);
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
      setMascotas([]);
    }

    try {
      const resS = await api.get('/solicitudes');
      const datosS = resS.data;
      const listaSolicitudes = Array.isArray(datosS) ? datosS : (datosS?.solicitudes || datosS?.datos || []);
      setSolicitudes(listaSolicitudes);
    } catch (err) {
      console.warn('Solicitudes no accesibles o lista vacía:', err);
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
        nombre: String(formMascota.nombre).trim(),
        especie: String(formMascota.especie).trim(),
        raza: String(formMascota.raza || 'Mestizo').trim(),
        sexo: String(formMascota.sexo),
        edad_aprox: Number(formMascota.edad_aprox) || 1,
        tamano: String(formMascota.tamano),
        ciudad: String(formMascota.ciudad),
        estado: String(formMascota.estado),
        descripcion: String(formMascota.descripcion || 'Sin descripción detallada.'),
        esterilizado: Boolean(formMascota.esterilizado),
        foto_url: String(formMascota.foto_url || '')
      };

      await api.post('/mascotas', payload);
      alert('¡Mascota registrada exitosamente en MongoDB Atlas!');
      setModalMascota(false);
      setFormMascota({
        nombre: '', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 1, tamano: 'Mediano', ciudad: 'Valparaíso', estado: 'Disponible', descripcion: '', esterilizado: false, foto_url: ''
      });
      cargarDatos();
    } catch (err) {
      console.error('Detalle de error al crear mascota:', err.response?.data);
      const errBackend = err.response?.data;
      let mensaje = 'Error al conectar con la base de datos para guardar la mascota.';

      if (typeof errBackend === 'string') mensaje = errBackend;
      else if (errBackend?.mensaje) mensaje = String(errBackend.mensaje);
      else if (errBackend?.error) mensaje = typeof errBackend.error === 'string' ? errBackend.error : JSON.stringify(errBackend.error);

      setErrorMsj(mensaje);
    }
  };

  const cambiarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      await api.patch(`/solicitudes/${id}`, { estado_solicitud: nuevoEstado });
      cargarDatos();
    } catch (err) {
      alert('Error al modificar el estado de la solicitud');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Menú de pestañas */}
        <div style={{ width: '220px' }}>
          <button 
            onClick={() => setTab('mascotas')}
            style={{ width: '100%', padding: '12px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', background: tab === 'mascotas' ? '#dbeafe' : '#fff', color: tab === 'mascotas' ? '#1d4ed8' : '#64748b', fontWeight: '600', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            Mascotas ({mascotas.length})
          </button>
          <button 
            onClick={() => setTab('solicitudes')}
            style={{ width: '100%', padding: '12px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', background: tab === 'solicitudes' ? '#dbeafe' : '#fff', color: tab === 'solicitudes' ? '#1d4ed8' : '#64748b', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            Solicitudes <span className="badge badge-pendiente">{solicitudes.length}</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1 }}>
          {tab === 'mascotas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', color: '#1e293b' }}>Gestión de Mascotas</h2>
                <button className="btn-primary" onClick={() => { setErrorMsj(''); setModalMascota(true); }}>+ Nueva mascota</button>
              </div>

              <div className="card">
                {mascotas.length === 0 ? (
                  <p style={{ color: '#64748b', padding: '10px 0' }}>No hay animales registrados. Haz clic en <strong>+ Nueva mascota</strong> para guardar el primero en MongoDB.</p>
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
                      {mascotas.map((m, idx) => (
                        <tr key={m._id || m.id_mascota || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: '600' }}>{m.nombre}</td>
                          <td style={{ padding: '10px' }}>{m.especie}</td>
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
              <h2 style={{ fontSize: '22px', color: '#1e293b' }}>Solicitudes de Adopción</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                {solicitudes.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No hay solicitudes registradas actualmente.</p>
                ) : (
                  solicitudes.map((s, idx) => (
                    <div key={s._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <strong>{s.id_mascota?.nombre || 'Mascota'}</strong>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Postulante: {s.nombre_postulante || 'Usuario interesado'}</p>
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

      {/* Modal para ingresar cualquier tipo de mascota */}
      {modalMascota && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ marginBottom: '14px' }}>Registrar Nueva Mascota</h3>

            {Boolean(errorMsj) && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {String(errorMsj)}
              </div>
            )}

            <form onSubmit={handleGuardarMascota} style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre</label>
                  <input type="text" required value={formMascota.nombre} onChange={e => setFormMascota({...formMascota, nombre: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Especie (Perro, Gato, Conejo, Ave...)</label>
                  <input type="text" required value={formMascota.especie} onChange={e => setFormMascota({...formMascota, especie: e.target.value})} placeholder="Ej: Conejo, Perro, Gato" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tamaño</label>
                  <select value={formMascota.tamano} onChange={e => setFormMascota({...formMascota, tamano: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Sexo</label>
                  <select value={formMascota.sexo} onChange={e => setFormMascota({...formMascota, sexo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Ciudad</label>
                  <select value={formMascota.ciudad} onChange={e => setFormMascota({...formMascota, ciudad: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Viña del Mar">Viña del Mar</option>
                    <option value="Santiago">Santiago</option>
                    <option value="Concepción">Concepción</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Edad aprox. (años)</label>
                  <input type="number" min="0" value={formMascota.edad_aprox} onChange={e => setFormMascota({...formMascota, edad_aprox: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Descripción</label>
                <textarea rows="2" value={formMascota.descripcion} onChange={e => setFormMascota({...formMascota, descripcion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalMascota(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar en MongoDB</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}