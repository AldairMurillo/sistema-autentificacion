import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import AlertMessage from './AlertMessage';

/**
 * Componente: Login
 * Propósito: Gestionar el inicio de sesión de los usuarios.
 * Conceptos clave:
 *  - Componentes funcionales y Hooks (useState).
 *  - Formularios controlados en React.
 *  - Validación en el cliente.
 *  - Peticiones asíncronas con Fetch API.
 *  - Enrutamiento con react-router-dom.
 *  - Uso de componentes reutilizables con Props (FormInput, AlertMessage).
 */
export default function Login() {
  // Hook de navegación para redirigir al usuario tras autenticarse con éxito
  const navigate = useNavigate();

  // Estado para almacenar los valores de los campos del formulario
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });

  // Estados para manejar la retroalimentación al usuario (errores, éxito y carga)
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);

  /**
   * Manejador genérico para inputs controlados.
   * Actualiza el estado 'formData' dinámicamente según el atributo 'name' del input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiamos errores previos al escribir
    if (error) setError('');
  };

  /**
   * Función asíncrona para enviar los datos de inicio de sesión a la API.
   */
  const handleLogin = async (e) => {
    // Evitamos el comportamiento por defecto del formulario (recarga de la página)
    e.preventDefault();

    // 1. Validación básica en el frontend
    if (!formData.correo.trim() || !formData.password.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Validación sencilla de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      setMensajeExito('');

      // 2. Petición POST a la API en Node.js/Express
      const respuesta = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: formData.correo.trim(),
          password: formData.password,
        }),
      });

      const datos = await respuesta.json();

      // 3. Manejo de la respuesta HTTP
      if (!respuesta.ok) {
        // Si el backend responde con un error (400, 401, 500, etc.)
        throw new Error(datos.mensaje || 'Error al iniciar sesión. Verifica tus credenciales.');
      }

      // Si las credenciales son válidas
      setMensajeExito(`¡Bienvenido, ${datos.usuario?.nombre || 'Usuario'}!`);

      // Opcional: Almacenar token o datos del usuario en sessionStorage / localStorage
      if (datos.token) {
        localStorage.setItem('token', datos.token);
      }

      // Redirigir al usuario tras un breve instante para mostrar el mensaje de bienvenida
      setTimeout(() => {
        // Aquí puedes redirigir a un dashboard o ruta protegida
        alert(`Inicio de sesión exitoso. Bienvenido ${datos.usuario?.nombre || ''}`);
        // navigate('/dashboard');
      }, 1000);

    } catch (err) {
      // Capturamos cualquier error en la red o devuelto por el servidor
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      // Finalizamos el estado de carga
      setCargando(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">Iniciar Sesión</h2>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder a la plataforma</p>
      </div>

      {/* AlertMessage recibe por prop 'tipo' y 'mensaje' para mostrar error o éxito */}
      <AlertMessage tipo="error" mensaje={error} />
      <AlertMessage tipo="exito" mensaje={mensajeExito} />

      <form onSubmit={handleLogin} className="auth-form" noValidate>
        {/* FormInput recibe por props: label, id, name, type, placeholder, value, onChange, disabled */}
        <FormInput
          label="Correo Electrónico"
          id="correo"
          name="correo"
          type="email"
          placeholder="ejemplo@universidad.edu.co"
          value={formData.correo}
          onChange={handleChange}
          disabled={cargando}
          required
        />

        <FormInput
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          disabled={cargando}
          required
        />

        {/* Enlace para recuperar contraseña */}
        <div className="form-helper">
          <Link to="/recuperar" className="auth-link helper-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botón de envío */}
        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>

      {/* Pie con enlace hacia el registro */}
      <div className="auth-footer">
        <span>¿No tienes una cuenta? </span>
        <Link to="/registro" className="auth-link">
          Registrarse
        </Link>
      </div>
    </div>
  );
}
