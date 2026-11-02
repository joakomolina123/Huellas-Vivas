import { useEffect, useState } from 'react';
import api, { mensajeDeError } from '../conexion/api';

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/solicitudes/mias')
      .then((res) => setSolicitudes(res.data.data))
      .catch((err) => setError(mensajeDeError(err)));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '30px auto', padding: '0 20px' }}>
      <h2>Historial de postulaciones</h2>
      {error && <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p>}
      <div className="card" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f4f6f8' }}>
              <th style={{ padding: 12 }}>Mascota</th>
              <th style={{ padding: 12 }}>Fecha</th>
              <th style={{ padding: 12 }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: 16 }}>Aún no has postulado a ninguna mascota.</td></tr>
            ) : solicitudes.map((s) => (
              <tr key={s.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{s.mascota?.nombre || s.mascota_nombre}</td>
                <td style={{ padding: 12, color: '#666' }}>{new Date(s.fecha_solicitud).toLocaleDateString('es-CL')}</td>
                <td style={{ padding: 12 }}>
                  <span className={`badge badge-${s.estado_solicitud.toLowerCase()}`}>{s.estado_solicitud}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
