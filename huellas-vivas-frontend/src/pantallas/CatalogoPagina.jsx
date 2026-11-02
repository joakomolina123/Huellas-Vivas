import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { mensajeDeError } from '../conexion/api';

const VACIO = { ciudad: '', especie: '', tamano: '', sexo: '', esterilizado: false };
const selectEstilo = { width: '100%', padding: 8, marginBottom: 14, borderRadius: 6, border: '1px solid #cbd5e1' };
const etiqueta = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 };

export default function CatalogoPagina() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [filtros, setFiltros] = useState(VACIO);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Las ciudades salen de la base de datos, no escritas a mano
  useEffect(() => {
    api.get('/mascotas/ciudades').then((res) => setCiudades(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = {};
    Object.entries(filtros).forEach(([k, v]) => { if (v) params[k] = v === true ? 'true' : v; });
    setCargando(true);
    setError('');
    api.get('/mascotas', { params })
      .then((res) => setMascotas(res.data.data.items))
      .catch((err) => { setMascotas([]); setError(mensajeDeError(err)); })
      .finally(() => setCargando(false));
  }, [filtros]);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '20px auto', padding: '0 20px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div className="card" style={{ width: 260, height: 'fit-content' }}>
        <h3 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', color: '#64748b' }}>Filtros</h3>

        <label style={etiqueta}>Estado</label>
        <input style={{ ...selectEstilo, background: '#f1f5f9' }} value="Disponible" disabled />

        <label style={etiqueta}>Ciudad</label>
        <select name="ciudad" value={filtros.ciudad} onChange={cambiar} style={selectEstilo}>
          <option value="">Todas las ciudades</option>
          {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={etiqueta}>Especie</label>
        <select name="especie" value={filtros.especie} onChange={cambiar} style={selectEstilo}>
          <option value="">Todas</option>
          {['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'].map((e) => <option key={e}>{e}</option>)}
        </select>

        <label style={etiqueta}>Tamaño</label>
        <select name="tamano" value={filtros.tamano} onChange={cambiar} style={selectEstilo}>
          <option value="">Todos</option>
          {['Pequeño', 'Mediano', 'Grande'].map((t) => <option key={t}>{t}</option>)}
        </select>

        <label style={etiqueta}>Sexo</label>
        <select name="sexo" value={filtros.sexo} onChange={cambiar} style={selectEstilo}>
          <option value="">Todos</option>
          <option>Macho</option>
          <option>Hembra</option>
        </select>

        <label style={{ display: 'flex', gap: 8, fontSize: 14, marginBottom: 12 }}>
          <input type="checkbox" name="esterilizado" checked={filtros.esterilizado} onChange={cambiar} /> Solo esterilizados
        </label>

        <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setFiltros(VACIO)}>Limpiar filtros</button>
      </div>

      <div style={{ flex: 1, minWidth: 280 }}>
        <h2 style={{ marginBottom: 16 }}>Mascotas disponibles ({mascotas.length})</h2>

        {error && <p style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</p>}

        {cargando ? <p style={{ color: '#64748b' }}>Cargando catálogo...</p>
          : mascotas.length === 0 && !error ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40 }}>🐾</div>
              <h3>No encontramos mascotas con estos filtros</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {mascotas.map((m) => {
                const foto = m.foto_url && (m.foto_url.startsWith('data:image') || m.foto_url.startsWith('http'));
                return (
                  <div key={m.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/mascota/${m.id}`)}>
                    <div style={{ height: 140, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' }}>
                      {foto ? <img src={m.foto_url} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 36 }}>{m.especie === 'Gato' ? '🐱' : m.especie === 'Conejo' ? '🐰' : '🐶'}</span>}
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{m.nombre}</h3>
                    <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: 13 }}>
                      {m.especie} · {m.sexo} · {m.ciudad}
                    </p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="badge badge-disponible">{m.estado}</span>
                      {m.esterilizado && <span className="badge badge-aprobada">Esterilizado</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
