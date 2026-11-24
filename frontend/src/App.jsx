import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import RutaProtegida from './RutaProtegida';
import Login from './pages/Login';
import Productos from './pages/Productos';
import Usuarios from './pages/Usuarios';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/productos"
          element={
            <RutaProtegida>
              <Productos />
            </RutaProtegida>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RutaProtegida soloAdmin>
              <Usuarios />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Routes>
    </>
  );
}