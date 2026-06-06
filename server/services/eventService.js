const { supabase } = require('../config/clients');

// 🛡️ Função de Sanitização (OWASP Top 10 - Prevenção contra XSS / Injection)
const sanitizeInput = (str) => {
  if (!str) return '';
  return str.replace(/[<>\/\\'";=\(\)]/g, '').trim();
};

// 🏃‍♂️ Consulta apenas os primeiros nomes de quem já está pago (para o carrossel) de um evento específico
async function getConfirmedAthletes(eventId) {
  if (!eventId) {
    throw new Error('eventId é obrigatório para obter atletas confirmados.');
  }

  const { data, error } = await supabase
    .from('registrations')
    .select('full_name')
    .eq('event_id', eventId)
    .eq('payment_status', 'paid');

  if (error) throw error;

  const displayNames = data
    .filter(r => r.full_name)
    .map(r => {
      const cleanName = sanitizeInput(r.full_name);
      const parts = cleanName.split(' ').filter(Boolean);
      
      if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1]}`;
      }
      return parts[0] || '';
    })
    .filter(name => name.length > 2);
  
  return displayNames;
}

// 🎫 Lógica de Lotes: retorna nome e preço baseado na ocupação e limites dinâmicos
const getLotInfo = (occupied, lotPrices, thresholds) => {
  const t1 = thresholds?.lot1 || 15;
  const t2 = thresholds?.lot2 || 30;

  if (occupied < t1) return { name: 'PRIMEIRO', price: lotPrices.lot1 || 110 };
  if (occupied < t2) return { name: 'SEGUNDO', price: lotPrices.lot2 || 130 };
  return { name: 'TERCEIRO', price: lotPrices.lot3 || 150 };
};

// 📊 Consulta o banco e retorna o status completo de um evento específico
async function getEventStatus(eventId, excludeRegistrationId = null) {
  if (!eventId) {
    throw new Error('eventId é obrigatório para consultar o status do evento.');
  }

  // 1. Busca as configurações direto do evento na tabela 'events'
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    throw new Error(`Evento com ID ${eventId} não foi encontrado.`);
  }

  // 2. Busca todas as inscrições associadas a este evento específico
  const { data: registrations, error: regError } = await supabase
    .from('registrations')
    .select('id, payment_status, reserved_until')
    .eq('event_id', eventId);

  if (regError) throw regError;

  const occupied = registrations.filter(r =>
    r.id !== excludeRegistrationId && (
      r.payment_status === 'paid' ||
      (r.payment_status === 'pending' && r.reserved_until && new Date(r.reserved_until) > new Date())
    )
  ).length;

  const lotPrices = event.lot_prices || { lot1: 110, lot2: 130, lot3: 150 };
  const lotThresholds = event.lot_thresholds || { lot1: 15, lot2: 30 };
  const eventCapacity = Number(event.capacity) || 50;
  const fees = event.fees || [];

  const lot = getLotInfo(occupied, lotPrices, lotThresholds);

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    capacity: eventCapacity,
    occupied,
    available: Math.max(0, eventCapacity - occupied),
    is_sold_out: occupied >= eventCapacity,
    currentLot: lot,
    fees
  };
}

module.exports = { getLotInfo, getEventStatus, getConfirmedAthletes };

