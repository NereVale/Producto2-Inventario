import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  function salir() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <strong>Inventario</strong>
        <Link to="/productos">Productos</Link>
        {esAdmin && <Link to="/usuarios">Usuarios</Link>}
      </div>
      <div className="navbar-user">
        <span>
          {usuario.nombre} ({usuario.rol})
        </span>
        <button onClick={salir}>Cerrar sesión</button>
      </div>
    </nav>
  );
}