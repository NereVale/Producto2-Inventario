require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function crearAdminInicial() {
  const nombre = 'Admin Uno';
  const email = 'admin@inventario.com';
  const password = 'admin1';

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      console.log('El administrador inicial ya existe. No se hizo nada.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, 'administrador')`,
      [nombre, email, passwordHash]
    );
    console.log('Administrador inicial creado:', email);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

crearAdminInicial();