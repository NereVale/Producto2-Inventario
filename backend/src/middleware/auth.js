const jwt = require('jsonwebtoken');

// Verifica que venga un token válido
function verificarToken(req, res, next) {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nombre, rol }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Verifica que el rol del usuario esté permitido
function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, permitirRoles };