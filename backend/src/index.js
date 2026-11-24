require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');

app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/productos', productosRoutes);


// Ruta de prueba: verifica que el servidor y Neon respondan
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, hora_db: result.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'No se pudo conectar a la base de datos' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});