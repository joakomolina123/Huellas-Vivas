import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../conexion/api';

export default function CatalogoPagina() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: 'Disponible',
    ciudad: 'Valparaíso',
    especie: '',
    tamano: '',
    sexo: '',
    esterilizado: false
  });

  const cargarMascotas = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
      if (filtros.especie) params.append('especie', filtros.especie);
      if (filtros.tamano) params.append('tamano', filtros.tamano);
      if (filtros.sexo) params.append('sexo', filtros.sexo);
      if (filtros.esterilizado) params.append('esterilizado', 'true');

      const res = await api.get(`/mascotas?${params.toString()}`);

      // Validación para extraer siempre un arreglo
      const datos = res.data;
      const lista = Array.isArray(datos)
        ? datos
        : (datos?.mascotas || datos?.datos || []);

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
        {/* Panel de Filtros */}
        <div className="card" style={{ width: '280px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', color: '#64748b' }}>
            Filtros obligatorios
          </h3>

          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            Estado
          </label>
          <input
            type="text"
            name="estado"
            value={filtros.estado}
            disabled
            style={{ width: '100%', padding: '8px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
          />

          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            Ciudad
          </label>
          <select
            name="ciudad"
            value={filtros.ciudad}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="Valparaíso">Valparaíso</option>
            <option value="Viña del Mar">Viña del Mar</option>
            <option value="Santiago">Santiago</option>
          </select>

          <h3 style={{ marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', color: '#64748b' }}>
            Filtros opcionales
          </h3>

          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
            Especie
          </label>
          <select
            name="especie"
            value={filtros.especie}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">Todas</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
          </select>

          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
            Tamaño
          </label>
          <select
            name="tamano"
            value={filtros.tamano}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">Todos</option>
            <option value="Pequeño">Pequeño</option>
            <option value="Mediano">Mediano</option>
            <option value="Grande">Grande</option>
          </select>

          <div style={{ marginBottom: '14px', fontSize: '14px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Sexo</label>
            <label style={{ marginRight: '10px' }}>
              <input type="radio" name="sexo" value="" checked={filtros.sexo === ''} onChange={handleChange} /> Todos
            </label>
            <label style={{ marginRight: '10px' }}>
              <input type="radio" name="sexo" value="Macho" checked={filtros.sexo === 'Macho'} onChange={handleChange} /> Macho
            </label>
            <label>
              <input type="radio" name="sexo" value="Hembra" checked={filtros.sexo === 'Hembra'} onChange={handleChange} /> Hembra
            </label>
          </div>

          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="checkbox" name="esterilizado" checked={filtros.esterilizado} onChange={handleChange} />
              <span style={{ marginLeft: '8px' }}>Solo esterilizados</span>
            </label>
          </div>
        </div>

        {/* Listado de Mascotas */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>
            Mascotas disponibles en {filtros.ciudad}
          </h2>

          {cargando ? (
            <p style={{ color: '#64748b' }}>Cargando catálogo...</p>
          ) : !Array.isArray(mascotas) || mascotas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐾</div>
              <h3>No encontramos mascotas con estos filtros</h3>
              <p style={{ color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>
                Prueba quitando algún filtro opcional o cambiando de ciudad.
              </p>
              <button
                className="btn-primary"
                onClick={() =>
                  setFiltros({
                    estado: 'Disponible',
                    ciudad: 'Valparaíso',
                    especie: '',
                    tamano: '',
                    sexo: '',
                    esterilizado: false
                  })
                }
              >
                Limpiar filtros opcionales
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {mascotas.map((m) => (
                <div
                  key={m._id || m.id_mascota || Math.random()}
                  className="card"
                  onClick={() => navigate(`/mascota/${m._id || m.id_mascota}`)}
                  style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                >
                  <div
                    style={{
                      height: '140px',
                      background: '#dbeafe',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      marginBottom: '12px'
                    }}
                  >
                    {m.foto_url || m.imagen ? (
                      <img src={m.foto_url || m.imagen} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '36px' }}>🐾</span>
                    )}
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1e293b' }}>{m.nombre}</h3>
                  <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: '13px' }}>
                    {m.especie} · {m.tamano || 'Mediano'} · {m.sexo || 'Macho'}
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