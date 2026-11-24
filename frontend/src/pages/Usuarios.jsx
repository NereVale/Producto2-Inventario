import { useEffect, useState } from 'react';
import { api } from '../api';

const FORMULARIO_VACIO = { nombre: '', email: '', password: '', rol: 'almacenista' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  async function cargarUsuarios() {
    try {
      const datos = await api('/usuarios');
      setUsuarios(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function crear(e) {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      await api('/usuarios', { method: 'POST', body: form });
      setMensaje('Usuario creado correctamente');
      setForm(FORMULARIO_VACIO);
      cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="contenedor">
      <h2>Usuarios</h2>

      <form className="tarjeta" onSubmit={crear}>
        <h3>Agregar usuario</h3>

        <div className="fila-form">
          <div>
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={cambiar} required />
          </div>
          <div>
            <label>Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={cambiar}
              required
            />
          </div>
          <div>
            <label>Contraseña (mínimo 6 caracteres)</label>
            <input
              type="password"
              name="password"
              minLength="6"
              value={form.password}
              onChange={cambiar}
              required
            />
          </div>
          <div>
            <label>Rol</label>
            <select name="rol" value={form.rol} onChange={cambiar}>
              <option value="almacenista">Almacenista</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {mensaje && <p className="exito">{mensaje}</p>}

        <button type="submit" style={{ marginTop: 16 }}>
          Crear usuario
        </button>
      </form>

      <div className="tarjeta">
        {cargando ? (
          <p>Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}