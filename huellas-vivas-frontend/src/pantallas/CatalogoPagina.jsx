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

      const res = await api.get(`/mascotas?${params.toString()}`);
      const datos = res.data;
      
      // Extrae la lista de la estructura paginada { items: [...] }
      const lista = Array.isArray(datos)
        ? datos
        : (datos?.items || datos?.mascotas || datos?.datos || []);

      setMascotas(lista);
    } catch (err) {
      console.error('Error al obtener mascotas:', err);
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
          </select>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
            Especie / Animal
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
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>
            Catálogo de Mascotas ({mascotas.length})
          </h2>

          {cargando ? (
            <p style={{ color: '#64748b' }}>Cargando datos...</p>
          ) : mascotas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐾</div>
              <h3>No hay mascotas registradas</h3>
              <p style={{ color: '#64748b', marginTop: '4px' }}>
                Registra la primera mascota en el <strong>Panel Refugio</strong>.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {mascotas.map((m) => (
                <div
                  key={m._id || m.id_mascota || Math.random()}
                  className="card"
                  onClick={() => navigate(`/mascota/${m._id || m.id_mascota}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ height: '140px', background: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '36px' }}>🐾</span>
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{m.nombre}</h3>
                  <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: '13px' }}>
                    {m.especie} · {m.ciudad || 'Valparaíso'}
                  </p>
                  <span className="badge badge-disponible">{m.estado || 'Disponible'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}