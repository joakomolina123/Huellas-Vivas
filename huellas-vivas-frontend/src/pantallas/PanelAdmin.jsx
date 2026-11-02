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
      const resObjM = resM.data;
      const listaMascotas = resObjM?.data?.items || resObjM?.items || resObjM?.mascotas || (Array.isArray(resObjM) ? resObjM : []);
      setMascotas(listaMascotas);
    } catch (err) {
      console.error('Error al obtener mascotas en panel:', err);
      setMascotas([]);
    }

    try {
      const resS = await api.get('/solicitudes');
      const resObjS = resS.data;
      const listaSolicitudes = resObjS?.data?.items || resObjS?.items || resObjS?.solicitudes || (Array.isArray(resObjS) ? resObjS : []);
      setSolicitudes(listaSolicitudes);
    } catch (err) {
      setSolicitudes([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para convertir la imagen elegida de la PC a formato Base64
  const handleImagenPC = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2 MB para guardarse rápidamente.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormMascota((prev) => ({
        ...prev,
        foto_url: reader.result // Cadena data:image/... en Base64
      }));
    };
    reader.readAsDataURL(file);
  };

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
      alert('¡Mascota con fotografía registrada con éxito!');
      setModalMascota(false);
      setFormMascota({
        nombre: '', especie: 'Perro', raza: 'Mestizo', sexo: 'Macho', edad_aprox: 1, tamano: 'Mediano', ciudad: 'Valparaíso', estado: 'Disponible', descripcion: '', esterilizado: false, foto_url: ''
      });
      cargarDatos();
    } catch (err) {
      console.error('Error al guardar:', err);
      setErrorMsj('Error al guardar la mascota en MongoDB Atlas. Intenta con una imagen de menor peso.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Pestañas de Navegación */}
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

        {/* Panel Central */}
        <div style={{ flex: 1 }}>
          {tab === 'mascotas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', color: '#1e293b' }}>Mascotas en Base de Datos</h2>
                <button className="btn-primary" onClick={() => { setErrorMsj(''); setModalMascota(true); }}>+ Nueva mascota</button>
              </div>

              <div className="card">
                {mascotas.length === 0 ? (
                  <p style={{ color: '#64748b', padding: '10px 0' }}>No hay mascotas registradas.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px' }}>
                        <th style={{ padding: '10px' }}>FOTO</th>
                        <th style={{ padding: '10px' }}>NOMBRE</th>
                        <th style={{ padding: '10px' }}>ESPECIE</th>
                        <th style={{ padding: '10px' }}>CIUDAD</th>
                        <th style={{ padding: '10px' }}>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mascotas.map((m, idx) => (
                        <tr key={m._id || m.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px' }}>
                            {m.foto_url ? (
                              <img src={m.foto_url} alt={m.nombre} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                            ) : (
                              '🐾'
                            )}
                          </td>
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
              <h2 style={{ fontSize: '22px', color: '#1e293b' }}>Solicitudes de adopción</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                {solicitudes.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No hay solicitudes de adopción.</p>
                ) : (
                  solicitudes.map((s, idx) => (
                    <div key={s._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <strong>{s.id_mascota?.nombre || 'Mascota'}</strong>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Postulante: {s.nombre_postulante || 'Usuario'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para ingresar mascota con Subida de Imagen desde la PC */}
      {modalMascota && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ marginBottom: '14px' }}>Registrar Nueva Mascota</h3>

            {Boolean(errorMsj) && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {errorMsj}
              </div>
            )}

            <form onSubmit={handleGuardarMascota} style={{ display: 'grid', gap: '10px' }}>
              {/* Botón selector de archivo desde la PC */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  Seleccionar foto desde tu computador
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImagenPC} 
                  style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                {formMascota.foto_url && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={formMascota.foto_url} alt="Vista previa" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>✓ Foto cargada</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre</label>
                  <input type="text" required value={formMascota.nombre} onChange={e => setFormMascota({...formMascota, nombre: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Especie</label>
                  <input type="text" required value={formMascota.especie} onChange={e => setFormMascota({...formMascota, especie: e.target.value})} placeholder="Perro, Gato, Conejo..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
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
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Ciudad</label>
                  <select value={formMascota.ciudad} onChange={e => setFormMascota({...formMascota, ciudad: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Viña del Mar">Viña del Mar</option>
                    <option value="Santiago">Santiago</option>
                    <option value="Quilpué">Quilpué</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Descripción</label>
                <textarea rows="2" value={formMascota.descripcion} onChange={e => setFormMascota({...formMascota, descripcion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalMascota(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Mascota</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}