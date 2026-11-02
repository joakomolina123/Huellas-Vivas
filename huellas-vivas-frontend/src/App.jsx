import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Catalogo from './pantallas/Catalogo';
import FichaMascota from './pantallas/FichaMascota';
import MisSolicitudes from './pantallas/MisSolicitudes';
import PanelAdmin from './pantallas/PanelAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <Link to="/" className="brand">
          🐾 Huellas Vivas
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Catálogo</Link>
          <Link to="/mis-solicitudes" className="nav-link">Mis Solicitudes</Link>
          <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>Panel Refugio</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/mascota/:id" element={<FichaMascota />} />
        <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
        <Route path="/admin" element={<PanelAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}