import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../conexion/api';

export default function CatalogoPagina() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    ciudad: '',
    especie: '',
    tamano: '',
    sexo: '',
    esterilizado: false
  });

  const cargarMascotas = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
      if (filtros.especie) params.append('especie', filtros.especie);
      if (filtros.tamano) params.append('tamano', filtros.tamano);
      if (filtros.sexo) params.append('sexo', filtros.sexo);
      if (filtros.esterilizado) params.append('esterilizado', 'true');

      const queryStr = params.toString();
      const res = await api.get(queryStr ? `/mascotas?${queryStr}` : '/mascotas');

      // Extrae la lista navegando la estructura exacta { ok: true, data: { items: [...] } }
      const resObj = res.data;
      const lista = resObj?.data?.items || resObj?.items || resObj?.mascotas || (Array.isArray(resObj) ? resObj : []);

      setMascotas(lista);
    } catch (err) {
      console.error('Error al obtener mascotas del catálogo:', err);
      setMascotas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMascotas();
  }, [filtros]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        
        {/* Panel de Filtros */}
        <div className="card" style={{ width: '280px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', color: '#64748b' }}>
            Filtros
          </h3>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
            Ciudad
          </label>
          <select
            name="ciudad"
            value={filtros.ciudad}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">Todas las ciudades</option>
            <option value="Valparaíso">Valparaíso</option>
            <option value="Viña del Mar">Viña del Mar</option>
            <option value="Santiago">Santiago</option>
            <option value="Quilpué">Quilpué</option>
          </select>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
            Especie / Tipo de Mascota
          </label>
          <select
            name="especie"
            value={filtros.especie}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">Todas las especies</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Conejo">Conejo</option>
            <option value="Ave">Ave</option>
            <option value="Otro">Otro</option>
          </select>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
            Tamaño
          </label>
          <select
            name="tamano"
            value={filtros.tamano}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">Todos los tamaños</option>
            <option value="Pequeño">Pequeño</option>
            <option value="Mediano">Mediano</option>
            <option value="Grande">Grande</option>
          </select>

          <button
            onClick={() => setFiltros({ ciudad: '', especie: '', tamano: '', sexo: '', esterilizado: false })}
            style={{ marginTop: '12px', width: '100%', padding: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            Limpiar filtros
          </button>
        </div>

        {/* Listado de Mascotas */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>
            Mascotas registradas en MongoDB ({mascotas.length})
          </h2>

          {cargando ? (
            <p style={{ color: '#64748b' }}>Cargando catálogo...</p>
          ) : mascotas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐾</div>
              <h3>No encontramos mascotas con estos filtros</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {mascotas.map((m) => (
                <div
                  key={m._id || m.id || Math.random()}
                  className="card"
                  onClick={() => navigate(`/mascota/${m._id || m.id}`)}
                  style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                >
                  <div style={{ height: '140px', background: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', overflow: 'hidden' }}>
                    {m.foto_url ? (
                      <img src={m.foto_url} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '36px' }}>
                        {m.especie === 'Gato' ? '🐱' : m.especie === 'Conejo' ? '🐰' : '🐶'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1e293b' }}>{m.nombre}</h3>
                  <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: '13px' }}>
                    {m.especie} · {m.tamano || 'Mediano'} · {m.ciudad || 'Valparaíso'}
                  </p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-disponible">{m.estado || 'Disponible'}</span>
                    {m.esterilizado && <span className="badge badge-aprobada">Esterilizado</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}