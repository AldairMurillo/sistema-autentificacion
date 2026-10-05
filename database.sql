-- =======================================================
-- SCRIPT DE BASE DE DATOS: universidad_auth
-- Asignatura: Desarrollo Web / Ingeniería de Software
-- =======================================================

-- 1. Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS universidad_auth
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE universidad_auth;

-- 2. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insertar usuario de prueba didáctico
-- Credenciales de prueba:
-- Correo: test@universidad.edu.co
-- Contraseña: password123
INSERT INTO usuarios (nombre, correo, password)
VALUES ('Estudiante Prueba', 'test@universidad.edu.co', 'password123')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
