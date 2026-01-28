import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email service for sending password reset emails
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    /**
     * Send password reset email
     * @param {string} email - User's email address
     * @param {string} resetToken - Password reset token
     * @returns {Promise} - Promise resolving to email send result
     */
    async sendPasswordResetEmail(email, resetToken) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4CAF50;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #45a049;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Restablecimiento de Contraseña</h1>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Finanzas Chatbot</strong>.</p>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Importante:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Este enlace es válido por <strong>1 hora</strong></li>
                <li>Si no solicitaste este cambio, ignora este email</li>
                <li>Nunca compartas este enlace con nadie</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Finanzas Chatbot. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        const mailOptions = {
            from: `"Finanzas Chatbot" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Restablecimiento de Contraseña - Finanzas Chatbot',
            html: htmlContent,
            text: `
        Restablecimiento de Contraseña
        
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        
        Para restablecer tu contraseña, visita el siguiente enlace:
        ${resetLink}
        
        Este enlace es válido por 1 hora.
        
        Si no solicitaste este cambio, ignora este email.
        
        Saludos,
        Equipo de Finanzas Chatbot
      `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            throw new Error('Error al enviar el correo electrónico');
        }
    }

    /**
     * Verify email service configuration
     * @returns {Promise} - Promise resolving to verification result
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service configurado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error en configuración de email:', error);
            return false;
        }
    }
}

export default new EmailService();
