const express = require('express');
const pool = require('../db');
const { verificarToken, permitirRoles } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren estar autenticado
router.use(verificarToken);

// Validación sencilla de los datos del producto
function validarProducto({ nombre, cantidad, precio }) {
  if (!nombre || String(nombre).trim() === '') {
    return 'El nombre es obligatorio';
  }
  if (cantidad === undefined || !Number.isInteger(Number(cantidad)) || Number(cantidad) < 0) {
    return 'La cantidad debe ser un número entero mayor o igual a 0';
  }
  if (precio === undefined || isNaN(Number(precio)) || Number(precio) < 0) {
    return 'El precio debe ser un número mayor o igual a 0';
  }
  return null;
}

// GET /productos -> ambos roles
router.get('/', permitirRoles('administrador', 'almacenista'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion, p.cantidad, p.precio, p.creado_en,
              u.nombre AS creado_por
       FROM productos p
       LEFT JOIN usuarios u ON u.id = p.creado_por
       ORDER BY p.id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /productos/:id -> ambos roles
router.get('/:id', permitirRoles('administrador', 'almacenista'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST /productos -> ambos roles
router.post('/', permitirRoles('administrador', 'almacenista'), async (req, res) => {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  const { nombre, descripcion, cantidad, precio } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, cantidad, precio, creado_por)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre.trim(), descripcion || null, Number(cantidad), Number(precio), req.usuario.id]
    );
    res.status(201).json({ mensaje: 'Producto agregado', producto: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

// PUT /productos/:id -> solo administrador
router.put('/:id', permitirRoles('administrador'), async (req, res) => {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  const { nombre, descripcion, cantidad, precio } = req.body;

  try {
    const result = await pool.query(
      `UPDATE productos
       SET nombre = $1, descripcion = $2, cantidad = $3, precio = $4
       WHERE id = $5
       RETURNING *`,
      [nombre.trim(), descripcion || null, Number(cantidad), Number(precio), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto actualizado', producto: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// DELETE /productos/:id -> solo administrador
router.delete('/:id', permitirRoles('administrador'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING id', [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;