const { Resend } = require('resend');
require('dotenv').config();

// 🔑 API KEY via Variável de Ambiente (.env)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 📧 Envia o Voucher de Confirmação e o Guia do Atleta
 */
async function sendVoucherEmail(registration) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Trail Run Club <atendimento@trailrunclub.com.br>',
      to: [registration.email],
      subject: `🔥 Inscrição Confirmada: ${registration.full_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #FDFBF9; padding: 40px; border-radius: 24px; border: 1px solid #E5E7EB;">
          <h1 style="color: #1A0F0A; text-transform: uppercase; font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 8px;">Inscrição Confirmada!</h1>
          <p style="color: #4B2C20; font-size: 16px; line-height: 1.6;">Sua vaga na <strong>Founder Edition 2026</strong> está garantida, <strong>${registration.full_name}</strong>!</p>
          
          <div style="background-color: #FFFFFF; padding: 24px; border-radius: 16px; border: 1px solid #F3F4F6; margin: 24px 0;">
            <p style="margin: 4px 0; font-size: 14px; color: #1A0F0A;"><strong>ID do Pedido:</strong> #${registration.id.slice(0, 8)}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1A0F0A;"><strong>Tamanho Camiseta:</strong> ${registration.shirt_size}</p>
          </div>

          <div style="background-color: #1A0F0A; color: #FFFFFF; padding: 32px; border-radius: 24px;">
            <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #D4B996; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">✅ INFORMAÇÕES IMPORTANTES</h2>
            
            <p style="font-size: 13px; margin-bottom: 16px;">📍 <strong>Local:</strong> FLONA (Floresta Nacional de Brasília) - Taguatinga Norte</p>
            <p style="font-size: 13px; margin-bottom: 16px;">⏰ <strong>Concentração:</strong> 07h00</p>
            <p style="font-size: 13px; margin-bottom: 24px;">🏃‍♂️ <strong>Trilha:</strong> 06 km (ida e volta) - Nível Fácil</p>

            <h3 style="font-size: 12px; text-transform: uppercase; color: #D4B996; margin-bottom: 12px;">🎒 O QUE LEVAR:</h3>
            <ul style="font-size: 13px; padding-left: 20px; line-height: 1.8; color: #E5E7EB;">
              <li>🍶 1L de Água no mínimo (por pessoa)</li>
              <li>🗑️ Saco de lixo</li>
              <li>👕 Camiseta (se possível com proteção UV)</li>
              <li>🧢 Chapéu / Boné / Calça Legging</li>
              <li>🥾 Bota/Tênis firme no pé (com cadarço)</li>
              <li>🧦 Meia cano longo (não vá de chinelo/sandália)</li>
              <li>🧴 Protetor Solar / Repelente</li>
              <li>💊 Antialérgicos ou medicamento de uso habitual</li>
            </ul>

            <div style="margin-top: 24px; padding: 16px; background-color: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
              <p style="font-size: 12px; color: #F87171; margin: 0;">⚠️ <strong>Atenção:</strong> Cuidado com animais peçonhentos. Alerte as pessoas próximas, não se aproxime e siga o caminho orientado.</p>
            </div>
          </div>

          <p style="color: #9CA3AF; font-size: 11px; margin-top: 40px; text-align: center; line-height: 1.6;">
            © 2026 Trail & Run Club • Flona Experience <br>
            Sua nota fiscal de serviço será emitida e enviada para este e-mail em até 7 dias úteis.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ [RESEND ERROR]:', error);
      return false;
    }

    console.log('✅ [EMAIL] Voucher e Guia enviados:', data.id);
    return true;
  } catch (err) {
    console.error('❌ [EMAIL EXCEPTION]:', err);
    return false;
  }
}

module.exports = { sendVoucherEmail };
