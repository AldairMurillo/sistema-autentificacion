# Sistema de Autenticación - React & Node.js (MySQL)

Este proyecto fue desarrollado para la materia **Desarrollo Web / Ingeniería de Software**. Implementa la arquitectura completa de autenticación con separación de responsabilidades:
- **Frontend**: Desarrollado con **React 18**, **React Router v6** y CSS Puro moderno.
- **Backend (Referencia)**: Desarrollado con **Node.js**, **Express** y **mysql2** (usando consultas parametrizadas para prevenir SQL Injection).
- **Base de Datos**: Script SQL para **MySQL**.

---

## 📁 Estructura del Proyecto

```text
sistema-autenticacion/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Formulario de inicio de sesión
│   │   ├── Register.jsx           # Formulario de registro con confirmación de clave
│   │   └── RecuperarPassword.jsx  # Formulario de restablecimiento de contraseña
│   ├── App.jsx                    # Configuración de rutas (React Router)
│   ├── App.css                    # Estilos modernos y minimalistas (CSS puro)
│   └── main.jsx                   # Punto de entrada de React
├── backend-ejemplo.js             # API REST didáctica en Express + MySQL
├── database.sql                   # Script para crear la BD y tabla en MySQL
├── index.html                     # Plantilla HTML
├── vite.config.js                 # Configuración del bundler Vite
└── package.json                   # Dependencias y scripts
```

---

## 🚀 Guía de Puesta en Marcha

### 1. Configurar la Base de Datos (MySQL con Docker)

El proyecto incluye [docker-compose.yml](file:///Users/aldairmurillomosquera/Documents/UNIVERSIDAD/SEMESTRE%204/DESARROLLO-WEB-2026-02/sistema-autenticacion/docker-compose.yml) listo para usar.
Para iniciar los contenedores de MySQL y phpMyAdmin:

```bash
docker compose up -d
```

- **MySQL Port:** `3306`
- **Base de datos:** `universidad_auth`
- **Usuario:** `user_universidad`
- **Contraseña:** `userpassword123`
- **phpMyAdmin (Panel Web visual):** [http://localhost:8080](http://localhost:8080)
  - Servidor: `mysql`
  - Usuario: `root` (o `user_universidad`)
  - Contraseña: `rootpassword` (o `userpassword123`)

Las credenciales ya se encuentran sincronizadas en el archivo [.env](file:///Users/aldairmurillomosquera/Documents/UNIVERSIDAD/SEMESTRE%204/DESARROLLO-WEB-2026-02/sistema-autenticacion/.env).

---

### 2. Iniciar el Backend (Node.js & Express)

En una terminal en la carpeta del proyecto:

```bash
npm run server
```
El servidor arrancará en `http://localhost:3000` con los siguientes endpoints disponibles:
- `POST /api/login`
- `POST /api/registro`
- `POST /api/recuperar`

---

### 3. Iniciar el Frontend (React + Vite)

En otra terminal en la misma carpeta:

```bash
npm run dev
```
Abre en tu navegador la dirección indicada (por defecto `http://localhost:5173`).

---

## 💡 Conceptos Didácticos Clave Implementados

1. **Hooks de React (`useState`, `useNavigate`)**:
   - Manejo del estado local para formularios controlados.
   - Manejo de estados de carga (`cargando`) y mensajes de retroalimentación (`error`, `mensajeExito`).
2. **Validación en Cliente**:
   - Comprobación de campos vacíos.
   - Validación de formato de correo con expresiones regulares (RegEx).
   - Validación de longitud mínima y coincidencia entre contraseñas en el registro.
3. **Peticiones HTTP Asíncronas**:
   - Uso de `async/await` con la API nativa `fetch`.
   - Manejo robusto de errores mediante bloques `try / catch / finally`.
4. **Seguridad en Backend (Prevención de SQL Injection)**:
   - Uso de sentencias preparadas con placeholders `?` en `mysql2`.
   - En lugar de interpolar cadenas como `WHERE correo = '${correo}'`, se usa `WHERE correo = ?`, evitando ataques de inyección SQL.
