/**
 * ============================================================================
 * SERVICIO AISLADO DE CORREO ELECTRÓNICO (Exclusivamente con Resend)
 * Capa de Servicio: 'Service Layer'
 * ============================================================================
 * Didáctica para tus compañeros:
 * Este módulo se encarga única y exclusivamente de comunicarse con la API de Resend
 * para enviar correos electrónicos transaccionales. El resto del backend no conoce
 * los detalles técnicos de Resend ni las plantillas HTML.
 */

import { Resend } from 'resend';

/**
 * Plantilla HTML moderna con Botón de Enlace Directo para el correo específico
 */
function generarPlantillaHTML(nombreUsuario, correoDestino, enlaceRecuperacion) {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 36px 30px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
          .badge { display: inline-block; background-color: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px; letter-spacing: 0.05em; }
          .title { color: #0f172a; font-size: 22px; font-weight: 800; margin: 0; }
          .content { color: #475569; line-height: 1.6; font-size: 15px; }
          .account-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 14px; }
          .account-box strong { color: #0f172a; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background-color: #4f46e5; color: #ffffff !important; padding: 14px 34px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35); }
          .alert-time { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; font-size: 13px; color: #92400e; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Seguridad de la Cuenta</span>
            <h1 class="title">Restablecer Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${nombreUsuario}</strong>,</p>
            <p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta:</p>
            
            <div class="account-box">
              Cuenta: <strong>${correoDestino}</strong>
            </div>

            <p>Para crear una nueva contraseña únicamente para esta cuenta, haz clic en el siguiente botón seguro:</p>
            
            <div class="button-container">
              <a href="${enlaceRecuperacion}" class="button" target="_blank">Cambiar Contraseña</a>
            </div>

            <div class="alert-time">
              ⏰ <strong>Aviso de seguridad:</strong> Este enlace es único para tu cuenta y expira en <strong>15 minutos</strong>. Al usarlo una vez quedará desactivado.
            </div>

            <p style="font-size: 13px; color: #64748b;">Si tú no solicitaste este cambio, no te preocupes: nadie puede cambiar tu contraseña sin este enlace.</p>
          </div>
          <div class="footer">
            <p>Desarrollo Web / Ingeniería de Software &copy; 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Función exclusiva para enviar el correo de recuperación usando Resend.
 * 
 * @param {string} destinatario - Correo que solicitó la recuperación
 * @param {string} token - Token criptográfico único asociado exclusivamente a este usuario
 * @param {string} [nombreUsuario] - Nombre del usuario
 */
export async function enviarCorreoRecuperacion(destinatario, token, nombreUsuario = 'Estudiante') {
  const apiKey = process.env.RESEND_API_KEY;
  const enlaceRecuperacion = `http://localhost:5173/restablecer-password?token=${token}`;

  // Si no hay API key configurada, simular en consola de manera didáctica
  if (!apiKey || !apiKey.startsWith('re_') || apiKey === 're_tu_api_key_aqui') {
    console.log('\n-----------------------------------------------------------');
    console.log('📬 [SIMULACIÓN RESEND - FALTA API KEY]');
    console.log(`Para enviar correos con Resend, añade tu API Key en .env:`);
    console.log(`RESEND_API_KEY=re_tu_clave_real`);
    console.log(`Destinatario: ${destinatario}`);
    console.log(`Enlace de restablecimiento generado: ${enlaceRecuperacion}`);
    console.log('-----------------------------------------------------------\n');
    return { success: true, simulated: true };
  }

  try {
    const resend = new Resend(apiKey);
    const remitente = process.env.EMAIL_FROM || 'Sistema Académico <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: remitente,
      to: [destinatario],
      subject: 'Restablecer contraseña de tu cuenta',
      html: generarPlantillaHTML(nombreUsuario, destinatario, enlaceRecuperacion),
    });

    if (error) {
      console.error('❌ Error devuelto por Resend:', error);
      if (error.message && error.message.includes('You can only send testing emails')) {
        throw new Error(
          'En el plan gratuito de pruebas de Resend, solo puedes enviar correos a la dirección con la que te registraste en Resend.'
        );
      }
      throw new Error(error.message || 'Error al enviar correo con Resend');
    }

    console.log(`✅ [RESEND] Correo de recuperación enviado a: ${destinatario} (ID: ${data.id})`);
    return { success: true, id: data.id };

  } catch (error) {
    console.error('❌ Excepción al enviar correo con Resend:', error.message);
    throw error;
  }
}
