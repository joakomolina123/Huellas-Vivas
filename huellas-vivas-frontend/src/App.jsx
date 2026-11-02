import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Importaciones con los nombres exactos de tu carpeta
import CatalogoPagina from './pantallas/CatalogoPagina.jsx';
import FichaMascota from './pantallas/FichaMascota.jsx';
import MisSolicitudes from './pantallas/MisSolicitudes.jsx';
import PanelAdmin from './pantallas/PanelAdmin.jsx';

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
        <Route path="/" element={<CatalogoPagina />} />
        <Route path="/mascota/:id" element={<FichaMascota />} />
        <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
        <Route path="/admin" element={<PanelAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}