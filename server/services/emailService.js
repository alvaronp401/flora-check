const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 📧 Envia o Voucher de Confirmação para o Atleta
 */
async function sendVoucherEmail(registration) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Trail Run Club <onboarding@resend.dev>', // 🛡️ Altere para seu domínio verificado depois
      to: [registration.email],
      subject: `🔥 Inscrição Confirmada: ${registration.full_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #FDFBF9; padding: 40px; border-radius: 24px; border: 1px solid #E5E7EB;">
          <h1 style="color: #1A0F0A; text-transform: uppercase; font-size: 24px; font-weight: 900; letter-spacing: -1px;">Inscrição Confirmada!</h1>
          <p style="color: #4B2C20; font-size: 16px; line-height: 1.6;">Olá, <strong>${registration.full_name}</strong>. Sua vaga na <strong>Founder Edition 2026</strong> está garantida!</p>
          
          <div style="background-color: #FFFFFF; padding: 24px; border-radius: 16px; border: 1px solid #F3F4F6; margin: 32px 0;">
            <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #9CA3AF; margin-bottom: 16px;">Detalhes do Voucher</h2>
            <p style="margin: 8px 0; font-size: 14px; color: #1A0F0A;"><strong>ID do Pedido:</strong> #${registration.id.slice(0, 8)}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #1A0F0A;"><strong>CPF:</strong> ${registration.cpf}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #1A0F0A;"><strong>Tamanho Camiseta:</strong> ${registration.shirt_size}</p>
          </div>

          <div style="background-color: #1A0F0A; color: #FFFFFF; padding: 24px; border-radius: 16px; text-align: center;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; opacity: 0.7;">Próximo Passo</p>
            <p style="font-size: 14px; font-weight: bold; margin: 0;">Fique atento ao seu e-mail. Enviaremos o guia oficial do atleta e o mapa do percurso em breve.</p>
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

    console.log('✅ [EMAIL] Voucher enviado com sucesso:', data.id);
    return true;
  } catch (err) {
    console.error('❌ [EMAIL EXCEPTION]:', err);
    return false;
  }
}

module.exports = { sendVoucherEmail };
