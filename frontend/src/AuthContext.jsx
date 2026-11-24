import { createContext, useContext, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  async function login(email, password) {
    const datos = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    setUsuario(datos.usuario);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  const esAdmin = usuario?.rol === 'administrador';

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}