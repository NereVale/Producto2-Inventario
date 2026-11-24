import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (usuario) return <Navigate to="/productos" replace />;

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(email, password);
      navigate('/productos');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-contenedor">
      <form className="tarjeta login-form" onSubmit={enviar}>
        <h2>Iniciar sesión</h2>

        <label>Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}