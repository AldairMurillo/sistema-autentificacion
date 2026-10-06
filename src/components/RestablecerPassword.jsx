import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import FormInput from './FormInput';
import AlertMessage from './AlertMessage';

/**
 * Componente: RestablecerPassword
 * Propósito: Permitir cambiar la contraseña ÚNICAMENTE para la cuenta que solicitó la recuperación,
 *            validando el token de seguridad presente en el enlace del correo.
 * Conceptos clave:
 *  - Hook useSearchParams para capturar el token de la URL (?token=...).
 *  - Hook useEffect para verificar la validez del token en el backend al cargar la página.
 *  - Vinculación estricta: solo se actualiza la cuenta asociada a dicho token.
 *  - Uso de componentes reutilizables con Props (FormInput, AlertMessage).
 */
export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Token obtenido de la URL del correo
  const token = searchParams.get('token');

  // Estados de verificación del token
  const [verificando, setVerificando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [cuentaCorreo, setCuentaCorreo] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');

  // Estados del formulario
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de feedback visual
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);

  // 1. Al cargar la pantalla, validamos el token con el backend
  useEffect(() => {
    if (!token) {
      setError('No se ha proporcionado un enlace de seguridad válido. Por favor, solicita la recuperación desde tu correo.');
      setVerificando(false);
      setTokenValido(false);
      return;
    }

    const verificarToken = async () => {
      try {
        setVerificando(true);
        const respuesta = await fetch(`http://localhost:3000/api/verificar-token/${token}`);
        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.valido) {
          throw new Error(datos.mensaje || 'El enlace de recuperación es inválido o ha expirado.');
        }

        // Token válido: extraemos los datos de la cuenta asociada
        setTokenValido(true);
        setCuentaCorreo(datos.correo);
        setNombreUsuario(datos.nombre);
        setError('');
      } catch (err) {
        setTokenValido(false);
        setError(err.message || 'Error al validar el enlace de recuperación.');
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [token]);

  // 2. Envío del formulario con la nueva contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Por favor, completa ambos campos de contraseña.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, revísalas.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      setMensajeExito('');

      const respuesta = await fetch('http://localhost:3000/api/restablecer-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: password,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al actualizar la contraseña.');
      }

      setMensajeExito(`¡Contraseña actualizada con éxito para ${cuentaCorreo}! Redirigiendo al login...`);
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setError(err.message || 'No fue posible actualizar la contraseña.');
    } finally {
      setCargando(false);
    }
  };

  // Estado 1: Cargando y verificando token
  if (verificando) {
    return (
      <div className="auth-card text-center">
        <h2>Verificando enlace...</h2>
        <p className="auth-subtitle">Validando la seguridad de tu enlace de recuperación.</p>
      </div>
    );
  }

  // Estado 2: Token inválido o no proporcionado
  if (!tokenValido) {
    return (
      <div className="auth-card text-center">
        {/* AlertMessage recibe por prop el mensaje de error */}
        <AlertMessage tipo="error" mensaje={error || 'Enlace no válido o expirado.'} />
        <h2>Enlace no disponible</h2>
        <p className="auth-subtitle" style={{ marginTop: '0.5rem' }}>
          Este enlace es inválido, ya fue utilizado o han pasado más de 15 minutos desde que fue generado.
        </p>
        <Link to="/recuperar" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.25rem', textDecoration: 'none' }}>
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
  }

  // Estado 3: Token válido: permite cambiar la contraseña para ESTA cuenta
  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">Restablecer Contraseña</h2>
        <p className="auth-subtitle">Estás cambiando la contraseña para la cuenta:</p>
        <div style={{
          backgroundColor: '#f1f5f9',
          color: '#1e293b',
          fontWeight: '700',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          marginTop: '0.6rem',
          display: 'inline-block',
          fontSize: '0.9rem',
          border: '1px solid #cbd5e1'
        }}>
          👤 {cuentaCorreo}
        </div>
      </div>

      {/* AlertMessage recibe por prop 'tipo' y 'mensaje' para mostrar error o éxito */}
      <AlertMessage tipo="error" mensaje={error} />
      <AlertMessage tipo="exito" mensaje={mensajeExito} />

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* FormInput recibe sus datos por props: label, id, name, type, placeholder, value, onChange, disabled */}
        <FormInput
          label="Nueva Contraseña"
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError('');
          }}
          disabled={cargando}
          required
        />

        <FormInput
          label="Confirmar Nueva Contraseña"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Repite la nueva contraseña"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError('');
          }}
          disabled={cargando}
          required
        />

        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? 'Actualizando contraseña...' : 'Guardar Nueva Contraseña'}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" className="auth-link">
          Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}
