import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Componente: Register
 * Propósito: Permitir a nuevos usuarios crear una cuenta en el sistema.
 * Conceptos clave:
 *  - Manejo de múltiples campos mediante un único objeto de estado.
 *  - Validación de coincidencia de contraseñas y longitud mínima en cliente.
 *  - Envío de datos vía POST asíncrono con fetch.
 *  - Retroalimentación visual y redirección guiada al Login tras registro exitoso.
 */
export default function Register() {
  const navigate = useNavigate();

  // Estado para capturar todos los datos del formulario de registro
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });

  // Estados de retroalimentación y carga
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);

  /**
   * Manejador de cambio para actualizar el estado del formulario.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  /**
   * Manejador para el envío del formulario de registro.
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    const { nombre, correo, password, confirmPassword } = formData;

    // 1. Validaciones en el Frontend
    // a) Verificar que no haya campos vacíos
    if (!nombre.trim() || !correo.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Por favor, completa todos los campos del formulario.');
      return;
    }

    // b) Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError('Por favor, ingresa un correo electrónico con formato válido.');
      return;
    }

    // c) Validar longitud mínima de la contraseña (buena práctica didáctica)
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // d) Validar que ambas contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, revísalas.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      setMensajeExito('');

      // 2. Envío de la petición POST a la API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const respuesta = await fetch(`${API_URL}/api/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          password: password,
        }),
      });

      const datos = await respuesta.json();

      // 3. Manejo de respuesta del servidor
      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al registrar el usuario.');
      }

      setMensajeExito('¡Registro exitoso! Redirigiendo al inicio de sesión...');

      // Limpiar formulario tras registro exitoso
      setFormData({
        nombre: '',
        correo: '',
        password: '',
        confirmPassword: '',
      });

      // Redirigir al Login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate para comenzar a usar la plataforma</p>
      </div>

      {/* Alertas de error o éxito */}
      {error && <div className="alert alert-error">{error}</div>}
      {mensajeExito && <div className="alert alert-success">{mensajeExito}</div>}

      <form onSubmit={handleRegister} className="auth-form" noValidate>
        {/* Campo Nombre Completo */}
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">
            Nombre Completo
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Juan Pérez"
            value={formData.nombre}
            onChange={handleChange}
            className="form-input"
            disabled={cargando}
            required
          />
        </div>

        {/* Campo Correo */}
        <div className="form-group">
          <label htmlFor="correo" className="form-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            placeholder="juan.perez@universidad.edu.co"
            value={formData.correo}
            onChange={handleChange}
            className="form-input"
            disabled={cargando}
            required
          />
        </div>

        {/* Campo Contraseña */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            disabled={cargando}
            required
          />
        </div>

        {/* Campo Confirmar Contraseña */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Repite la contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            disabled={cargando}
            required
          />
        </div>

        {/* Botón de Registro */}
        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? 'Registrando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      {/* Enlace para volver al login */}
      <div className="auth-footer">
        <span>¿Ya tienes una cuenta? </span>
        <Link to="/login" className="auth-link">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
