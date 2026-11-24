import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, esAdmin } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && !esAdmin) return <Navigate to="/productos" replace />;

  return children;
}