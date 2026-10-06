import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from './FormInput';
import AlertMessage from './AlertMessage';

/**
 * Componente: RecuperarPassword
 * Propósito: Permitir a los usuarios solicitar un enlace o código de recuperación de contraseña vía correo.
 * Conceptos clave:
 *  - Estado simple con useState para un único input.
 *  - Retroalimentación informativa (éxito/error) amigable para el usuario.
 *  - Comunicación asíncrona con el endpoint de recuperación.
 *  - Uso de componentes reutilizables con Props (FormInput, AlertMessage).
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
      const respuesta = await fetch('http://localhost:3000/api/recuperar', {
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

      {/* AlertMessage recibe por prop 'tipo' y 'mensaje' para mostrar error o éxito */}
      <AlertMessage tipo="error" mensaje={error} />
      <AlertMessage tipo="exito" mensaje={mensajeExito} />

      <form onSubmit={handleRecuperar} className="auth-form" noValidate>
        {/* FormInput recibe sus datos por props: label, id, name, type, placeholder, value, onChange, disabled */}
        <FormInput
          label="Correo Electrónico"
          id="correo"
          name="correo"
          type="email"
          placeholder="ejemplo@universidad.edu.co"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            if (error) setError('');
          }}
          disabled={cargando}
          required
        />

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
