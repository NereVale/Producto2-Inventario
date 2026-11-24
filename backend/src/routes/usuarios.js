const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { verificarToken, permitirRoles } = require('../middleware/auth');

const router = express.Router();

const ROLES_VALIDOS = ['administrador', 'almacenista'];

// Todas las rutas de este archivo requieren token y rol administrador
router.use(verificarToken, permitirRoles('administrador'));

// GET /usuarios -> lista de usuarios (sin contraseñas)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// POST /usuarios -> crear un usuario nuevo
router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Usa administrador o almacenista' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      [nombre, email, passwordHash, rol]
    );

    res.status(201).json({ mensaje: 'Usuario creado', usuario: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;