import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { SesionProvider, useSesion } from './contexto/Sesion.jsx';
import CatalogoPagina from './pantallas/CatalogoPagina.jsx';
import FichaMascota from './pantallas/FichaMascota.jsx';
import MisSolicitudes from './pantallas/MisSolicitudes.jsx';
import PanelAdmin from './pantallas/PanelAdmin.jsx';
import Acceso from './pantallas/Acceso.jsx';

// Deja pasar solo a quien tenga el rol indicado; si no, lo manda a iniciar sesión
function Protegida({ rol, children }) {
  const { usuario, cargando } = useSesion();
  if (cargando) return <p style={{ padding: 24 }}>Cargando...</p>;
  if (!usuario || usuario.rol !== rol) return <Navigate to="/acceso" replace />;
  return children;
}

function Encabezado() {
  const { usuario, cerrarSesion } = useSesion();
  return (
    <header className="app-header">
      <Link to="/" className="brand">🐾 Huellas Vivas</Link>
      <nav className="nav-links">
        <Link to="/" className="nav-link">Catálogo</Link>
        {usuario?.rol === 'Usuario' && <Link to="/mis-solicitudes" className="nav-link">Mis solicitudes</Link>}
        {usuario?.rol === 'Administrador' && <Link to="/admin" className="nav-link">Panel refugio</Link>}
        {usuario ? (
          <>
            <span style={{ fontSize: 14, color: '#64748b' }}>{usuario.nombre}</span>
            <button className="btn-secondary" onClick={cerrarSesion}>Salir</button>
          </>
        ) : (
          <Link to="/acceso" className="btn-primary" style={{ textDecoration: 'none' }}>Ingresar</Link>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <SesionProvider>
      <BrowserRouter>
        <Encabezado />
        <Routes>
          <Route path="/" element={<CatalogoPagina />} />
          <Route path="/mascota/:id" element={<FichaMascota />} />
          <Route path="/acceso" element={<Acceso />} />
          <Route path="/mis-solicitudes" element={<Protegida rol="Usuario"><MisSolicitudes /></Protegida>} />
          <Route path="/admin" element={<Protegida rol="Administrador"><PanelAdmin /></Protegida>} />
        </Routes>
      </BrowserRouter>
    </SesionProvider>
  );
}
