const API_URL = 'http://localhost:3000';

export async function api(ruta, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const datos = await respuesta.json().catch(() => ({}));

  // Token vencido o inválido: se cierra la sesión
  if (respuesta.status === 401 && ruta !== '/auth/login') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || 'Error en la petición');
  }

  return datos;
}