const { Resend } = require('resend');
const { supabase } = require('../config/clients');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Gzq8Rom45jm9rsFTf81jM5?s=sh&p=i&ilr=1&amv=2';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function firstName(fullName = '') {
  return fullName.trim().split(/\s+/)[0] || 'atleta';
}

async function getEventForRegistration(registration) {
  if (registration.events) return registration.events;
  if (!registration.event_id) return null;

  const { data, error } = await supabase
    .from('events')
    .select('slug, title, description, date, location')
    .eq('id', registration.event_id)
    .single();

  if (error) {
    console.error('[EMAIL] Falha ao buscar evento para o voucher:', error);
    return null;
  }

  return data;
}

function flona12kmTemplate(registration, event) {
  const name = escapeHtml(registration.full_name);
  const shortName = escapeHtml(firstName(registration.full_name));
  const orderId = escapeHtml(registration.id.slice(0, 8));
  const shirtSize = escapeHtml(registration.shirt_size || 'Nao informado');
  const eventTitle = escapeHtml(event?.title || 'Trilha Flona 12km');

  return {
    subject: `Inscricao confirmada: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #07170B; padding: 28px; color: #F8FAFC;">
        <div style="background-color: #0D2312; border: 1px solid rgba(255,255,255,0.10); border-radius: 24px; padding: 32px;">
          <p style="margin: 0 0 10px; color: #00E676; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Trail&Run Club</p>
          <h1 style="margin: 0 0 12px; color: #FFFFFF; font-size: 30px; line-height: 1.05; font-weight: 900; text-transform: uppercase;">Inscricao confirmada!</h1>
          <p style="margin: 0; color: rgba(255,255,255,0.70); font-size: 16px; line-height: 1.6;">
            Parabens, <strong style="color:#FFFFFF;">${shortName}</strong>. Sua vaga na <strong style="color:#FFFFFF;">Trilha 12km na FLONA</strong> esta garantida.
          </p>

          <div style="background-color: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 18px; padding: 20px; margin: 26px 0;">
            <p style="margin: 0 0 8px; color: rgba(255,255,255,0.88); font-size: 14px;"><strong>Atleta:</strong> ${name}</p>
            <p style="margin: 0 0 8px; color: rgba(255,255,255,0.88); font-size: 14px;"><strong>ID do pedido:</strong> #${orderId}</p>
            <p style="margin: 0; color: rgba(255,255,255,0.88); font-size: 14px;"><strong>Tamanho da camiseta:</strong> ${shirtSize}</p>
          </div>

          <div style="background-color: #FFFFFF; color: #0B1A0B; border-radius: 18px; padding: 22px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 15px; line-height: 1.3; text-transform: uppercase; letter-spacing: 1px;">Informacoes do encontro</h2>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Data:</strong> 14/06, domingo</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Horario:</strong> 07h30</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Local:</strong> FLONA Brasilia</p>
            <p style="margin: 0; font-size: 14px;"><strong>Percurso:</strong> 12km guiados, com paradas no Corrego Geladeira e Pinheiral.</p>
          </div>

          <h3 style="margin: 0 0 12px; color: #FFFFFF; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">O que levar</h3>
          <ul style="margin: 0 0 24px; padding-left: 20px; color: rgba(255,255,255,0.72); font-size: 14px; line-height: 1.8;">
            <li>Agua para o percurso</li>
            <li>Tenis firme ou bota confortavel</li>
            <li>Protetor solar e repelente</li>
            <li>Roupa leve para trilha</li>
            <li>Medicamentos de uso habitual, se necessario</li>
          </ul>

          <a href="${WHATSAPP_GROUP_URL}" target="_blank" rel="noreferrer" style="display: block; background-color: #00D66B; color: #061109; text-align: center; text-decoration: none; border-radius: 16px; padding: 16px 18px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
            Entrar no grupo oficial
          </a>

          <p style="margin: 24px 0 0; color: rgba(255,255,255,0.45); font-size: 12px; line-height: 1.6; text-align: center;">
            Nos vemos na trilha. Trail&Run Club
          </p>
        </div>
      </div>
    `,
  };
}

function eixaoSulTemplate(registration, event) {
  const name = escapeHtml(registration.full_name);
  const shortName = escapeHtml(firstName(registration.full_name));
  const orderId = escapeHtml(registration.id.slice(0, 8));
  const eventTitle = escapeHtml(event?.title || 'Aulao no Eixao Sul');

  return {
    subject: `Inscricao confirmada: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #07170B; padding: 28px; color: #F8FAFC;">
        <div style="background-color: #0D2312; border: 1px solid rgba(255,255,255,0.10); border-radius: 24px; padding: 32px;">
          <p style="margin: 0 0 10px; color: #00E676; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Trail&Run Club</p>
          <h1 style="margin: 0 0 12px; color: #FFFFFF; font-size: 30px; line-height: 1.05; font-weight: 900; text-transform: uppercase;">Inscricao confirmada!</h1>
          <p style="margin: 0; color: rgba(255,255,255,0.70); font-size: 16px; line-height: 1.6;">
            Parabens, <strong style="color:#FFFFFF;">${shortName}</strong>. Sua vaga no <strong style="color:#FFFFFF;">Aulao no Eixao Sul</strong> esta garantida.
          </p>

          <div style="background-color: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 18px; padding: 20px; margin: 26px 0;">
            <p style="margin: 0 0 8px; color: rgba(255,255,255,0.88); font-size: 14px;"><strong>Participante:</strong> ${name}</p>
            <p style="margin: 0; color: rgba(255,255,255,0.88); font-size: 14px;"><strong>ID do pedido:</strong> #${orderId}</p>
          </div>

          <div style="background-color: #FFFFFF; color: #0B1A0B; border-radius: 18px; padding: 22px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 15px; line-height: 1.3; text-transform: uppercase; letter-spacing: 1px;">Informacoes do encontro</h2>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Data:</strong> 21/06, domingo</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Horario:</strong> 08h00</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Local:</strong> Eixao Sul</p>
            <p style="margin: 0; font-size: 14px;"><strong>Atividade:</strong> Alongamento + corrida/caminhada em grupo com Prof. Jonathas Armiliato.</p>
          </div>

          <h3 style="margin: 0 0 12px; color: #FFFFFF; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">O que levar</h3>
          <ul style="margin: 0 0 24px; padding-left: 20px; color: rgba(255,255,255,0.72); font-size: 14px; line-height: 1.8;">
            <li>Agua</li>
            <li>Roupa confortavel para movimento</li>
            <li>Tenis para corrida/caminhada</li>
            <li>Sua canga para o cafe coletivo</li>
            <li>Algo simples para compartilhar no cafe, se quiser</li>
          </ul>

          <a href="${WHATSAPP_GROUP_URL}" target="_blank" rel="noreferrer" style="display: block; background-color: #00D66B; color: #061109; text-align: center; text-decoration: none; border-radius: 16px; padding: 16px 18px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
            Entrar no grupo oficial
          </a>

          <p style="margin: 24px 0 0; color: rgba(255,255,255,0.45); font-size: 12px; line-height: 1.6; text-align: center;">
            Nos vemos no Eixao. Trail&Run Club
          </p>
        </div>
      </div>
    `,
  };
}

function founderTemplate(registration) {
  const name = escapeHtml(registration.full_name);
  const orderId = escapeHtml(registration.id.slice(0, 8));
  const shirtSize = escapeHtml(registration.shirt_size || 'Nao informado');

  return {
    subject: `Inscricao Confirmada: ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FDFBF9; padding: 40px; border-radius: 24px; border: 1px solid #E5E7EB;">
        <h1 style="color: #1A0F0A; text-transform: uppercase; font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 8px;">Inscricao Confirmada!</h1>
        <p style="color: #4B2C20; font-size: 16px; line-height: 1.6;">Sua vaga na <strong>Founder Edition 2026</strong> esta garantida, <strong>${name}</strong>!</p>

        <div style="background-color: #FFFFFF; padding: 24px; border-radius: 16px; border: 1px solid #F3F4F6; margin: 24px 0;">
          <p style="margin: 4px 0; font-size: 14px; color: #1A0F0A;"><strong>ID do Pedido:</strong> #${orderId}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #1A0F0A;"><strong>Tamanho Camiseta:</strong> ${shirtSize}</p>
        </div>

        <div style="background-color: #1A0F0A; color: #FFFFFF; padding: 32px; border-radius: 24px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #D4B996; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Informacoes importantes</h2>
          <p style="font-size: 13px; margin-bottom: 16px;"><strong>Local:</strong> FLONA - Taguatinga Norte</p>
          <p style="font-size: 13px; margin-bottom: 16px;"><strong>Concentracao:</strong> 07h00</p>
          <p style="font-size: 13px; margin-bottom: 24px;"><strong>Trilha:</strong> 06 km - Nivel facil</p>
        </div>

        <p style="color: #9CA3AF; font-size: 11px; margin-top: 40px; text-align: center; line-height: 1.6;">
          2026 Trail&Run Club
        </p>
      </div>
    `,
  };
}

async function sendVoucherEmail(registration) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[EMAIL] RESEND_API_KEY ausente. E-mail nao enviado.');
      return false;
    }

    const event = await getEventForRegistration(registration);
    const template = event?.slug === 'flona-12km'
      ? flona12kmTemplate(registration, event)
      : event?.slug === 'alongamento-corrida-eixao-sul'
        ? eixaoSulTemplate(registration, event)
        : founderTemplate(registration);

    const { data, error } = await resend.emails.send({
      from: 'Trail Run Club <atendimento@trailrunclub.com.br>',
      to: [registration.email],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('[RESEND ERROR]:', error);
      return false;
    }

    console.log('[EMAIL] Voucher enviado:', data.id);
    return true;
  } catch (err) {
    console.error('[EMAIL EXCEPTION]:', err);
    return false;
  }
}

module.exports = { sendVoucherEmail };
