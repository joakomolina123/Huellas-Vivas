import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Catalogo from './pantallas/Catalogo';
import FichaMascota from './pantallas/FichaMascota';
import MisSolicitudes from './pantallas/MisSolicitudes';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '18px', color: '#1c3144' }}>🐾 Huellas Vivas</strong>
        <div>
          <Link to="/" style={{ marginRight: '16px', textDecoration: 'none', color: '#333', fontWeight: '500' }}>Catálogo</Link>
          <Link to="/mis-solicitudes" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Mis Solicitudes</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/mascota/:id" element={<FichaMascota />} />
        <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
      </Routes>
    </BrowserRouter>
  );
}