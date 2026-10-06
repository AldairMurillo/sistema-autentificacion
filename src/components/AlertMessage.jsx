import React from 'react';

/**
 * Componente reutilizable: AlertMessage
 *
 * Propósito: Mostrar mensajes de retroalimentación al usuario (errores o éxitos)
 * sin repetir el mismo JSX en cada componente de la aplicación.
 *
 * Props recibidas:
 *  @param {string} tipo    - Define el estilo visual: 'error' o 'exito'.
 *  @param {string} mensaje - Texto del mensaje a mostrar.
 *
 * Si 'mensaje' está vacío o es null, el componente no renderiza nada.
 */
export default function AlertMessage({ tipo, mensaje }) {
  // Si no hay mensaje, no renderizamos nada (evita espacio vacío en el DOM)
  if (!mensaje) return null;

  // Mapeamos el tipo recibido por prop a la clase CSS correspondiente
  const claseCSS = tipo === 'exito' ? 'alert alert-success' : 'alert alert-error';

  return (
    <div className={claseCSS}>
      {mensaje}
    </div>
  );
}
