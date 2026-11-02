import React, { useState, useEffect } from 'react';
import api from '../conexion/api';

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    api.get('/solicitudes')
      .then((res) => setSolicitudes(res.data.datos || res.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h2>Historial de Postulaciones</h2>
      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginTop: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f4f6f8', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '12px' }}>Mascota</th>
              <th style={{ padding: '12px' }}>Fecha</th>
              <th style={{ padding: '12px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '16px' }}>No hay solicitudes registradas.</td></tr>
            ) : (
              solicitudes.map((s) => (
                <tr key={s._id || s.id_solicitud} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.id_mascota?.nombre || 'Mascota'}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString() : 'Reciente'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: s.estado_solicitud === 'Aprobada' ? '#d4edda' : s.estado_solicitud === 'Rechazada' ? '#f8d7da' : '#fff3cd', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {s.estado_solicitud || 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}