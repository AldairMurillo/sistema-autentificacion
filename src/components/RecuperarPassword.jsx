import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente: RecuperarPassword
 * Propósito: Permitir a los usuarios solicitar un enlace o código de recuperación de contraseña vía correo.
 * Conceptos clave:
 *  - Estado simple con useState para un único input.
 *  - Retroalimentación informativa (éxito/error) amigable para el usuario.
 *  - Comunicación asíncrona con el endpoint de recuperación.
 */
export default function RecuperarPassword() {
  // Estado para almacenar el correo electrónico ingresado
  const [correo, setCorreo] = useState('');

  // Estados para feedback visual
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);

  /**
   * Manejador de envío para procesar la solicitud de recuperación.
   */
  const handleRecuperar = async (e) => {
    e.preventDefault();

    // 1. Validación en el frontend
    if (!correo.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      setMensajeExito('');

      // 2. Envío de petición POST al backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const respuesta = await fetch(`${API_URL}/api/recuperar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: correo.trim(),
        }),
      });

      const datos = await respuesta.json();

      // 3. Manejo de respuesta
      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al procesar la solicitud de recuperación.');
      }

      setMensajeExito(
        datos.mensaje || 'Se ha enviado un enlace de recuperación a tu correo electrónico.'
      );
      setCorreo(''); // Limpiamos el campo tras el envío
    } catch (err) {
      setError(err.message || 'No fue posible conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">Recuperar Contraseña</h2>
        <p className="auth-subtitle">
          Ingresa tu correo institucional o personal y te enviaremos las instrucciones de restablecimiento.
        </p>
      </div>

      {/* Alertas */}
      {error && <div className="alert alert-error">{error}</div>}
      {mensajeExito && <div className="alert alert-success">{mensajeExito}</div>}

      <form onSubmit={handleRecuperar} className="auth-form" noValidate>
        {/* Campo Correo */}
        <div className="form-group">
          <label htmlFor="correo" className="form-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            placeholder="ejemplo@universidad.edu.co"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              if (error) setError('');
            }}
            className="form-input"
            disabled={cargando}
            required
          />
        </div>

        {/* Botón de envío */}
        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? 'Enviando instrucciones...' : 'Enviar Instrucciones'}
        </button>
      </form>

      {/* Enlaces de regreso */}
      <div className="auth-footer">
        <span>¿Te acordaste de tu contraseña? </span>
        <Link to="/login" className="auth-link">
          Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}
