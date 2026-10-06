import React from 'react';

/**
 * Componente reutilizable: FormInput
 *
 * Propósito: Encapsular un campo de formulario completo (label + input) para
 * no repetir el mismo bloque HTML en cada formulario de la aplicación.
 *
 * Props recibidas:
 *  @param {string}   label       - Texto visible de la etiqueta del campo.
 *  @param {string}   id          - ID único del input (vincula el label con el input).
 *  @param {string}   name        - Nombre del campo (usado en el estado del formulario).
 *  @param {string}   type        - Tipo de input: 'text', 'email', 'password', etc.
 *  @param {string}   placeholder - Texto de ejemplo dentro del campo.
 *  @param {string}   value       - Valor actual controlado por el estado del padre.
 *  @param {Function} onChange    - Función que se ejecuta al cambiar el valor.
 *  @param {boolean}  disabled    - Deshabilita el campo mientras se procesa una petición.
 *  @param {boolean}  required    - Indica si el campo es obligatorio (HTML5).
 */
export default function FormInput({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  required = false,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="form-input"
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
