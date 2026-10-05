/**
 * ============================================================================
 * ARCHIVO DE EJEMPLO DE BACKEND (Node.js + Express + MySQL)
 * Asignatura: Desarrollo Web / Ingeniería de Software
 * Propósito: Demostrar la recepción de peticiones desde el frontend de React,
 *            la conexión segura a MySQL (mysql2) y la prevención de SQL Injection.
 * ============================================================================
 */

import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise'; // Usamos la versión con promesas (async/await)
import { enviarCorreoRecuperacion } from './services/emailService.js'; // Servicio desacoplado de correo

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
// 1. CORS: Permite que nuestra app React (ej. en localhost:5173 o 3000) se comunique con esta API
app.use(cors());

// 2. express.json(): Parsea automáticamente el cuerpo (body) de las peticiones en formato JSON
app.use(express.json());

// ==========================================
// POOL DE CONEXIONES A MYSQL
// ==========================================
// Un 'Pool' administra un conjunto de conexiones reutilizables a la base de datos,
// mejorando el rendimiento y la escalabilidad del sistema.
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'universidad_auth',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificación inicial de conexión a la base de datos
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conexión exitosa a la base de datos MySQL');
    connection.release(); // Liberamos la conexión de prueba al pool
  } catch (error) {
    console.error('⚠️  Aviso: No se pudo conectar a MySQL:', error.message);
    console.log('👉 Asegúrate de tener MySQL corriendo y la base de datos "universidad_auth" creada.');
  }
})();

// ==========================================
// ENDPOINT 1: INICIO DE SESIÓN (POST /api/login)
// ==========================================
app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;

  // 1. Validación de campos requeridos
  if (!correo || !password) {
    return res.status(400).json({
      error: true,
      mensaje: 'El correo y la contraseña son requeridos.',
    });
  }

  try {
    /**
     * BUENA PRÁCTICA DE SEGURIDAD (Ingeniería de Software):
     * Usar consultas parametrizadas con '?' para PREVENIR SQL INJECTION.
     * NUNCA concatenar valores directamente en la cadena SQL:
     * MAL:  `SELECT * FROM usuarios WHERE correo = '${correo}'` (Vulnerable)
     * BIEN: `SELECT * FROM usuarios WHERE correo = ?` (Seguro)
     */
    const query = 'SELECT id, nombre, correo, password FROM usuarios WHERE correo = ? LIMIT 1';
    const [filas] = await db.execute(query, [correo]);

    // Si no se encuentra ningún usuario con ese correo
    if (filas.length === 0) {
      return res.status(401).json({
        error: true,
        mensaje: 'Credenciales inválidas. Usuario no encontrado.',
      });
    }

    const usuario = filas[0];

    /**
     * NOTA DIDÁCTICA SOBRE CONTRASEÑAS:
     * Para este ejemplo básico académico comparamos texto plano:
     * En un entorno de producción REAL, las contraseñas se almacenan con HASH usando
     * bibliotecas como 'bcrypt':
     * const passwordValida = await bcrypt.compare(password, usuario.password);
     */
    const passwordValida = (usuario.password === password);

    if (!passwordValida) {
      return res.status(401).json({
        error: true,
        mensaje: 'Credenciales inválidas. Contraseña incorrecta.',
      });
    }

    // Respuesta exitosa (nunca devolver el campo 'password' al cliente)
    return res.status(200).json({
      error: false,
      mensaje: 'Autenticación exitosa.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
      // En sistemas modernos con JWT se genera un token aquí:
      token: 'jwt-token-simulado-clase-web-2026',
    });

  } catch (error) {
    console.error('Error en /api/login:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error interno del servidor al procesar el inicio de sesión.',
    });
  }
});

// ==========================================
// ENDPOINT 2: REGISTRO DE USUARIOS (POST /api/registro)
// ==========================================
app.post('/api/registro', async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({
      error: true,
      mensaje: 'Todos los campos son obligatorios.',
    });
  }

  try {
    // 1. Verificar si el correo ya existe
    const [existentes] = await db.execute(
      'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        error: true,
        mensaje: 'Ya existe una cuenta registrada con este correo electrónico.',
      });
    }

    // 2. Insertar el nuevo usuario usando consulta preparada
    const insertQuery = 'INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)';
    const [resultado] = await db.execute(insertQuery, [nombre, correo, password]);

    return res.status(201).json({
      error: false,
      mensaje: 'Usuario registrado exitosamente.',
      usuarioId: resultado.insertId,
    });

  } catch (error) {
    console.error('Error en /api/registro:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error interno del servidor al registrar el usuario.',
    });
  }
});

// ==========================================
// ENDPOINT 3: RECUPERAR CONTRASEÑA (POST /api/recuperar)
// ==========================================
app.post('/api/recuperar', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({
      error: true,
      mensaje: 'El correo electrónico es requerido.',
    });
  }

  try {
    const [usuarios] = await db.execute(
      'SELECT id, nombre, correo FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    // Si el usuario no existe, devolvemos mensaje genérico por seguridad
    if (usuarios.length === 0) {
      return res.status(200).json({
        error: false,
        mensaje: 'Si el correo existe en el sistema, recibirás el enlace en breve.',
      });
    }

    const usuario = usuarios[0];

    // 1. Generamos un token criptográfico único y seguro
    const token = crypto.randomBytes(32).toString('hex');

    // 2. Asociamos el token EXCLUSIVAMENTE al ID de este usuario en MySQL con expiración de 15 minutos
    await db.execute(
      'UPDATE usuarios SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
      [token, usuario.id]
    );

    // 3. Enviamos el correo con Resend a esa dirección específica
    await enviarCorreoRecuperacion(usuario.correo, token, usuario.nombre);

    return res.status(200).json({
      error: false,
      mensaje: 'Hemos enviado el enlace de restablecimiento a tu correo.',
    });

  } catch (error) {
    console.error('Error en /api/recuperar:', error.message || error);
    return res.status(500).json({
      error: true,
      mensaje: error.message || 'Error interno al procesar la solicitud.',
    });
  }
});

// ==========================================
// ENDPOINT 4: VERIFICAR TOKEN DE ENLACE (GET /api/verificar-token/:token)
// Valida que el enlace que abrió el usuario sea válido y le pertenece a su cuenta
// ==========================================
app.get('/api/verificar-token/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ valido: false, mensaje: 'Token no proporcionado.' });
  }

  try {
    const [filas] = await db.execute(
      'SELECT id, nombre, correo FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1',
      [token]
    );

    if (filas.length === 0) {
      return res.status(400).json({
        valido: false,
        mensaje: 'El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.',
      });
    }

    const usuario = filas[0];
    return res.status(200).json({
      valido: true,
      correo: usuario.correo,
      nombre: usuario.nombre,
    });

  } catch (error) {
    console.error('Error en /api/verificar-token:', error.message || error);
    return res.status(500).json({ valido: false, mensaje: 'Error interno al verificar el token.' });
  }
});

// ==========================================
// ENDPOINT 5: CAMBIAR CONTRASEÑA DE LA CUENTA (POST /api/restablecer-password)
// Cambia ÚNICAMENTE la contraseña de la cuenta a la cual pertenece el token
// ==========================================
app.post('/api/restablecer-password', async (req, res) => {
  const { token, password } = req.body;

  // 1. Validaciones
  if (!token) {
    return res.status(400).json({
      error: true,
      mensaje: 'El token de recuperación es requerido.',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: true,
      mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.',
    });
  }

  try {
    // 2. Buscar al usuario ÚNICO asociado a este token activo
    const [filas] = await db.execute(
      'SELECT id, nombre, correo FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1',
      [token]
    );

    if (filas.length === 0) {
      return res.status(400).json({
        error: true,
        mensaje: 'El enlace es inválido o ha expirado (límite de 15 minutos). Por favor solicita uno nuevo.',
      });
    }

    const usuario = filas[0];

    // 3. Actualizar la contraseña ÚNICAMENTE para este usuario específico y quemar (inutilizar) el token
    await db.execute(
      'UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [password, usuario.id]
    );

    console.log(`🔐 [ÉXITO] Contraseña cambiada exclusivamente para la cuenta: ${usuario.correo}`);

    return res.status(200).json({
      error: false,
      mensaje: `¡Contraseña actualizada con éxito para ${usuario.correo}! Ya puedes iniciar sesión.`,
      correo: usuario.correo,
    });

  } catch (error) {
    console.error('Error en /api/restablecer-password:', error.message || error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error interno del servidor al actualizar la contraseña.',
    });
  }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en: http://localhost:${PORT}`);
  console.log(`👉 Rutas disponibles:`);
  console.log(`   - POST http://localhost:${PORT}/api/login`);
  console.log(`   - POST http://localhost:${PORT}/api/registro`);
  console.log(`   - POST http://localhost:${PORT}/api/recuperar`);
  console.log(`   - GET  http://localhost:${PORT}/api/verificar-token/:token`);
  console.log(`   - POST http://localhost:${PORT}/api/restablecer-password`);
});
