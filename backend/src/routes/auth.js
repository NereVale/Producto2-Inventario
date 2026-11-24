const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /auth/me (ruta protegida para probar el token)
router.get('/me', verificarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;