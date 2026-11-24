import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const FORMULARIO_VACIO = { nombre: '', descripcion: '', cantidad: '', precio: '' };

export default function Productos() {
  const { esAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  async function cargarProductos() {
    try {
      const datos = await api('/productos');
      setProductos(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORMULARIO_VACIO);
    setError('');
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    const cuerpo = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      cantidad: Number(form.cantidad),
      precio: Number(form.precio),
    };

    try {
      if (editandoId) {
        await api(`/productos/${editandoId}`, { method: 'PUT', body: cuerpo });
        setMensaje('Producto actualizado');
      } else {
        await api('/productos', { method: 'POST', body: cuerpo });
        setMensaje('Producto agregado');
      }
      cancelarEdicion();
      cargarProductos();
    } catch (err) {
      setError(err.message);
    }
  }

  function empezarEdicion(producto) {
    setEditandoId(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      cantidad: producto.cantidad,
      precio: producto.precio,
    });
    setMensaje('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function eliminar(producto) {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    setError('');
    setMensaje('');
    try {
      await api(`/productos/${producto.id}`, { method: 'DELETE' });
      setMensaje('Producto eliminado');
      cargarProductos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="contenedor">
      <h2>Productos</h2>

      <form className="tarjeta" onSubmit={guardar}>
        <h3>{editandoId ? 'Editar producto' : 'Agregar producto'}</h3>

        <div className="fila-form">
          <div>
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={cambiar} required />
          </div>
          <div>
            <label>Descripción</label>
            <input name="descripcion" value={form.descripcion} onChange={cambiar} />
          </div>
          <div>
            <label>Cantidad</label>
            <input
              type="number"
              min="0"
              step="1"
              name="cantidad"
              value={form.cantidad}
              onChange={cambiar}
              required
            />
          </div>
          <div>
            <label>Precio</label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="precio"
              value={form.precio}
              onChange={cambiar}
              required
            />
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {mensaje && <p className="exito">{mensaje}</p>}

        <div className="acciones" style={{ marginTop: 16 }}>
          <button type="submit">{editandoId ? 'Guardar cambios' : 'Agregar'}</button>
          {editandoId && (
            <button type="button" className="secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="tarjeta">
        {cargando ? (
          <p>Cargando...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Agregado por</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.cantidad}</td>
                  <td>${Number(p.precio).toFixed(2)}</td>
                  <td>{p.creado_por || '-'}</td>
                  {esAdmin && (
                    <td>
                      <div className="acciones">
                        <button onClick={() => empezarEdicion(p)}>Editar</button>
                        <button className="peligro" onClick={() => eliminar(p)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}