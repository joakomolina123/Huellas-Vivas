import { useCallback, useEffect, useState } from 'react';
import api, { mensajeDeError } from '../conexion/api';

const celda = { padding: 10, textAlign: 'left' };
const campo = { padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', width: '100%' };
const NUEVA = { nombre: '', especie: 'Perro', raza: '', sexo: 'Macho', edad_aprox: '', tamano: 'Mediano', ciudad: '', esterilizado: false, foto_url: '', descripcion: '' };

// Reduce la foto elegida a ~400px para que no pese (se guarda como texto en la base)
function reducirImagen(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(new Error('No se pudo leer la imagen'));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rechazar(new Error('El archivo no es una imagen válida'));
      img.onload = () => {
        const escala = Math.min(1, 400 / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * escala;
        canvas.height = img.height * escala;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolver(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

function Tabla({ columnas, filas }) {
  return (
    <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: 20 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f4f6f8' }}>{columnas.map((c) => <th key={c} style={celda}>{c}</th>)}</tr></thead>
        <tbody>
          {filas.length === 0
            ? <tr><td colSpan={columnas.length} style={celda}>Sin datos.</td></tr>
            : filas.map((f, i) => <tr key={i} style={{ borderTop: '1px solid #eee' }}>{f.map((v, j) => <td key={j} style={celda}>{v}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Pestaña 1: solicitudes (RF07) ---------- */
function Solicitudes({ avisar }) {
  const [items, setItems] = useState([]);
  const [filtro, setFiltro] = useState('Pendiente');

  const cargar = useCallback(() => {
    api.get('/solicitudes', { params: filtro ? { estado: filtro } : {} })
      .then((res) => setItems(res.data.data.items))
      .catch((err) => avisar('error', mensajeDeError(err)));
  }, [filtro, avisar]);
  useEffect(() => { cargar(); }, [cargar]);

  const resolver = async (id, accion) => {
    try {
      const res = await api.patch(`/solicitudes/${id}/${accion}`);
      avisar('ok', res.data.mensaje);
      cargar();
    } catch (err) { avisar('error', mensajeDeError(err)); }
  };

  return (
    <>
      <select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ ...campo, width: 200, marginBottom: 12 }}>
        <option value="">Todas</option><option>Pendiente</option><option>Aprobada</option><option>Rechazada</option>
      </select>
      <Tabla columnas={['Mascota', 'Postulante', 'Correo', 'Fecha', 'Estado', 'Acciones']}
        filas={items.map((s) => [
          s.mascota?.nombre || s.mascota_nombre,
          s.usuario?.nombre || s.usuario_nombre,
          s.usuario?.correo,
          new Date(s.fecha_solicitud).toLocaleDateString('es-CL'),
          <span className={`badge badge-${s.estado_solicitud.toLowerCase()}`}>{s.estado_solicitud}</span>,
          s.estado_solicitud === 'Pendiente' && (
            <span style={{ display: 'flex', gap: 6 }}>
              <button className="btn-primary" onClick={() => resolver(s.id, 'aprobar')}>Aprobar</button>
              <button className="btn-danger" onClick={() => resolver(s.id, 'rechazar')}>Rechazar</button>
            </span>
          ),
        ])} />
    </>
  );
}

/* ---------- Pestaña 2: mantenedor de mascotas (RF05) ---------- */
function Mascotas({ avisar }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(NUEVA);
  const [editandoId, setEditandoId] = useState(null);

  const cargar = useCallback(() => {
    api.get('/mascotas/gestion', { params: { limit: 100 } })
      .then((res) => setItems(res.data.data.items))
      .catch((err) => avisar('error', mensajeDeError(err)));
  }, [avisar]);
  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const elegirFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    try { setForm({ ...form, foto_url: await reducirImagen(archivo) }); }
    catch (err) { avisar('error', err.message); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const datos = { ...form, edad_aprox: form.edad_aprox === '' ? null : Number(form.edad_aprox) };
    if (!datos.foto_url) delete datos.foto_url;
    try {
      if (editandoId) await api.put(`/mascotas/${editandoId}`, datos);
      else await api.post('/mascotas', datos);
      avisar('ok', editandoId ? 'Mascota actualizada' : 'Mascota registrada');
      setForm(NUEVA);
      setEditandoId(null);
      cargar();
    } catch (err) { avisar('error', mensajeDeError(err)); }
  };

  const editar = (m) => {
    setEditandoId(m.id);
    setForm({ ...NUEVA, ...m, raza: m.raza || '', edad_aprox: m.edad_aprox ?? '', descripcion: m.descripcion || '', foto_url: m.foto_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cambiarEstado = async (m) => {
    try {
      await api.patch(`/mascotas/${m.id}/estado`, { estado: m.estado === 'Disponible' ? 'Adoptada' : 'Disponible' });
      cargar();
    } catch (err) { avisar('error', mensajeDeError(err)); }
  };

  return (
    <>
      <form className="card" onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        <input style={campo} name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required />
        <select style={campo} name="especie" value={form.especie} onChange={cambiar}>{['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'].map((x) => <option key={x}>{x}</option>)}</select>
        <input style={campo} name="raza" placeholder="Raza" value={form.raza} onChange={cambiar} />
        <select style={campo} name="sexo" value={form.sexo} onChange={cambiar}><option>Macho</option><option>Hembra</option></select>
        <input style={campo} type="number" min="0" max="40" name="edad_aprox" placeholder="Edad (años)" value={form.edad_aprox} onChange={cambiar} />
        <select style={campo} name="tamano" value={form.tamano} onChange={cambiar}><option>Pequeño</option><option>Mediano</option><option>Grande</option></select>
        <input style={campo} name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={cambiar} required />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" name="esterilizado" checked={form.esterilizado} onChange={cambiar} /> Esterilizado</label>
        <input style={campo} name="foto_url" placeholder="URL de la foto (o sube un archivo)" value={form.foto_url.startsWith('data:') ? '(imagen cargada)' : form.foto_url} onChange={cambiar} />
        <input style={campo} type="file" accept="image/*" onChange={elegirFoto} />
        <textarea style={{ ...campo, gridColumn: '1 / -1' }} name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={cambiar} />
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button className="btn-primary">{editandoId ? 'Guardar cambios' : 'Agregar mascota'}</button>
          {editandoId && <button type="button" className="btn-secondary" onClick={() => { setEditandoId(null); setForm(NUEVA); }}>Cancelar</button>}
        </div>
      </form>

      <Tabla columnas={['Nombre', 'Especie', 'Ciudad', 'Estado', 'Acciones']}
        filas={items.map((m) => [
          m.nombre, m.especie, m.ciudad,
          <span className={`badge badge-${m.estado.toLowerCase()}`}>{m.estado}</span>,
          <span style={{ display: 'flex', gap: 6 }}>
            <button className="btn-secondary" onClick={() => editar(m)}>Editar</button>
            <button className="btn-secondary" onClick={() => cambiarEstado(m)}>Marcar {m.estado === 'Disponible' ? 'adoptada' : 'disponible'}</button>
          </span>,
        ])} />
    </>
  );
}

/* ---------- Pestaña 3: reportes (consultas con $lookup, $group, $match, $in) ---------- */
function Reportes({ avisar }) {
  const [r, setR] = useState({});

  useEffect(() => {
    const rutas = ['solicitudes-por-mascota', 'adopciones-por-ciudad', 'solicitudes-detalle', 'mascotas-por-especie'];
    Promise.all(rutas.map((x) => api.get(`/reportes/${x}`)))
      .then((resp) => setR(Object.fromEntries(rutas.map((x, i) => [x, resp[i].data.data]))))
      .catch((err) => avisar('error', mensajeDeError(err)));
  }, [avisar]);

  const t = (titulo, detalle, nodo) => (
    <section style={{ marginBottom: 8 }}>
      <h3>{titulo}</h3>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>{detalle}</p>
      {nodo}
    </section>
  );

  return (
    <>
      {t('Solicitudes por mascota', 'Consulta con $group + $lookup (une solicitudes con mascotas y cuenta)',
        <Tabla columnas={['Mascota', 'Especie', 'Ciudad', 'Total', 'Pendientes']}
          filas={(r['solicitudes-por-mascota'] || []).map((x) => [x.nombre, x.especie, x.ciudad, x.total, x.pendientes])} />)}
      {t('Adopciones por ciudad', 'Consulta con $match + $lookup + $group',
        <Tabla columnas={['Ciudad', 'Adopciones']}
          filas={(r['adopciones-por-ciudad'] || []).map((x) => [x.ciudad, x.adopciones])} />)}
      {t('Detalle de solicitudes', 'Consulta con $in y dos $lookup (usuarios y mascotas)',
        <Tabla columnas={['Mascota', 'Postulante', 'Ciudad', 'Estado']}
          filas={(r['solicitudes-detalle'] || []).map((x) => [x.mascota, x.usuario, x.ciudad, x.estado_solicitud])} />)}
      {t('Mascotas por especie', 'Consulta con $group y $avg (edad promedio)',
        <Tabla columnas={['Especie', 'Total', 'Disponibles', 'Adoptadas', 'Edad promedio']}
          filas={(r['mascotas-por-especie'] || []).map((x) => [x.especie, x.total, x.disponibles, x.adoptadas, x.edad_promedio])} />)}
    </>
  );
}

export default function PanelAdmin() {
  const [pestana, setPestana] = useState('solicitudes');
  const [aviso, setAviso] = useState(null);
  const avisar = useCallback((tipo, texto) => setAviso({ tipo, texto }), []);

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 12 }}>Panel del refugio</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['solicitudes', 'Solicitudes'], ['mascotas', 'Mascotas'], ['reportes', 'Reportes']].map(([k, n]) => (
          <button key={k} className={pestana === k ? 'btn-primary' : 'btn-secondary'} onClick={() => { setPestana(k); setAviso(null); }}>{n}</button>
        ))}
      </div>
      {aviso && (
        <p style={{ marginBottom: 12, padding: 10, borderRadius: 8, fontSize: 14,
          background: aviso.tipo === 'ok' ? '#dcfce7' : '#fee2e2', color: aviso.tipo === 'ok' ? '#15803d' : '#b91c1c' }}>
          {aviso.texto}
        </p>
      )}
      {pestana === 'solicitudes' && <Solicitudes avisar={avisar} />}
      {pestana === 'mascotas' && <Mascotas avisar={avisar} />}
      {pestana === 'reportes' && <Reportes avisar={avisar} />}
    </div>
  );
}
