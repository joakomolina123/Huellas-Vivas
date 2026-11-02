import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../conexion/api';

export default function Catalogo() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: 'Disponible',
    ciudad: 'Valparaíso',
    especie: '',
    tamano: '',
    sexo: '',
    esterilizado: false
  });

  const cargarMascotas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
      if (filtros.especie) params.append('especie', filtros.especie);
      if (filtros.tamano) params.append('tamano', filtros.tamano);
      if (filtros.sexo) params.append('sexo', filtros.sexo);
      if (filtros.esterilizado) params.append('esterilizado', 'true');

      const res = await api.get(`/mascotas?${params.toString()}`);
      setMascotas(res.data.datos || res.data || []);
    } catch (err) {
      console.error('Error al obtener mascotas:', err);
    }
  };

  useEffect(() => {
    cargarMascotas();
  }, [filtros]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="container">
      <h2>Huellas Vivas — Catálogo de mascotas</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Panel de Filtros */}
        <div style={{ width: '260px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
          <h4>Filtros obligatorios</h4>
          <label style={{ fontSize: '14px' }}>Estado</label>
          <input type="text" name="estado" value={filtros.estado} disabled style={{ width: '100%', marginBottom: '12px', padding: '6px' }} />

          <label style={{ fontSize: '14px' }}>Ciudad</label>
          <select name="ciudad" value={filtros.ciudad} onChange={handleChange} style={{ width: '100%', marginBottom: '16px', padding: '6px' }}>
            <option value="Valparaíso">Valparaíso</option>
            <option value="Viña del Mar">Viña del Mar</option>
            <option value="Santiago">Santiago</option>
          </select>

          <h4>Filtros opcionales</h4>
          <label style={{ fontSize: '14px' }}>Especie</label>
          <select name="especie" value={filtros.especie} onChange={handleChange} style={{ width: '100%', marginBottom: '12px', padding: '6px' }}>
            <option value="">Todas</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
          </select>

          <label style={{ fontSize: '14px' }}>Tamaño</label>
          <select name="tamano" value={filtros.tamano} onChange={handleChange} style={{ width: '100%', marginBottom: '12px', padding: '6px' }}>
            <option value="">Todos</option>
            <option value="Pequeño">Pequeño</option>
            <option value="Mediano">Mediano</option>
            <option value="Grande">Grande</option>
          </select>

          <div style={{ marginBottom: '12px', fontSize: '14px' }}>
            <label>Sexo: </label><br />
            <input type="radio" name="sexo" value="" checked={filtros.sexo === ''} onChange={handleChange} /> Todos{' '}
            <input type="radio" name="sexo" value="Macho" checked={filtros.sexo === 'Macho'} onChange={handleChange} /> Macho{' '}
            <input type="radio" name="sexo" value="Hembra" checked={filtros.sexo === 'Hembra'} onChange={handleChange} /> Hembra
          </div>

          <div style={{ fontSize: '14px' }}>
            <input type="checkbox" name="esterilizado" checked={filtros.esterilizado} onChange={handleChange} />
            <label style={{ marginLeft: '6px' }}>Esterilizado</label>
          </div>
        </div>

        {/* Grilla de Mascotas */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {mascotas.map((m) => (
            <div 
              key={m._id || m.id_mascota} 
              onClick={() => navigate(`/mascota/${m._id || m.id_mascota}`)}
              style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', background: '#fff', cursor: 'pointer' }}
            >
              <div style={{ height: '130px', background: '#dce8f5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.foto_url ? <img src={m.foto_url} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} /> : <span style={{ color: '#666' }}>Foto</span>}
              </div>
              <h3 style={{ margin: '10px 0 4px', fontSize: '18px' }}>{m.nombre}</h3>
              <p style={{ margin: '0 0 8px', color: '#666', fontSize: '13px' }}>{m.especie} · {m.ciudad} · {m.sexo}</p>
              <span style={{ background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {m.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}