import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RecuperarPassword from './components/RecuperarPassword';
import RestablecerPassword from './components/RestablecerPassword';
import './App.css';

/**
 * Componente Principal: App
 * Propósito: Configurar el enrutador central de la aplicación cliente utilizando React Router v6.
 * Rutas configuradas:
 *  - /login -> Vista para iniciar sesión
 *  - /registro -> Vista para crear una nueva cuenta
 *  - /recuperar -> Vista para solicitud de restablecimiento de contraseña
 *  - /restablecer-password -> Vista para cambiar contraseña con token o código
 *  - / (raíz) -> Redirige automáticamente a /login
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="auth-wrapper">
        <header className="university-brand">
          <span className="brand-badge">Ingeniería de Software</span>
          <h1 className="brand-title">Sistema de Autenticación</h1>
        </header>

        <main className="auth-container">
          <Routes>
            {/* Redirección por defecto de la ruta raíz a /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/recuperar" element={<RecuperarPassword />} />
            <Route path="/restablecer-password" element={<RestablecerPassword />} />

            {/* Ruta comodín para capturar URLs no existentes (404) */}
            <Route
              path="*"
              element={
                <div className="auth-card text-center">
                  <h2>404 - Página no encontrada</h2>
                  <p className="auth-subtitle">La ruta a la que intentas acceder no existe.</p>
                  <a href="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
                    Ir al Inicio de Sesión
                  </a>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="auth-site-footer">
          <p>Desarrollo Web &copy; 2026 - Universidad</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
