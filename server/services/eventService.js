const { supabase, MAX_CAPACITY } = require('../config/clients');

// 🛡️ Função de Sanitização (OWASP Top 10 - Prevenção contra XSS / Injection)
// Impede que um usuário malicioso cadastre o nome como "<script>alert('Hacked')</script>"
const sanitizeInput = (str) => {
  if (!str) return '';
  // Remove caracteres perigosos usados em injeções de HTML/JS e SQL
  return str.replace(/[<>\/\\'";=\(\)]/g, '').trim();
};

// 🏃‍♂️ Consulta apenas os primeiros nomes de quem já está pago (para o carrossel)
async function getConfirmedAthletes() {
  const { data, error } = await supabase
    .from('registrations')
    .select('full_name')
    .eq('payment_status', 'paid');

  if (error) throw error;

  // Regra de Negócio: Pegamos Nome e Sobrenome e blindamos contra ataques (OWASP)
  const displayNames = data
    .filter(r => r.full_name)
    .map(r => {
      // 1. Sanitiza o input do banco contra injeções
      const cleanName = sanitizeInput(r.full_name);
      
      // 2. Separa por espaços para pegar o Nome e o Sobrenome
      const parts = cleanName.split(' ').filter(Boolean); // filter(Boolean) remove espaços extras
      
      if (parts.length > 1) {
        // Pega o Primeiro e o Último nome (Ex: João ... Silva)
        return `${parts[0]} ${parts[parts.length - 1]}`;
      }
      
      // Se tiver só um nome, retorna só ele
      return parts[0] || '';
    })
    .filter(name => name.length > 2); // Garante que não retorne strings vazias ou letras soltas
  
  // Retorna a lista
  return displayNames;
}


// 🎫 Lógica de Lotes: retorna nome e preço baseado na ocupação e limites dinâmicos
const getLotInfo = (occupied, lotPrices, thresholds) => {
  // Fallbacks seguros: se não houver no banco, usa 15 e 30
  const t1 = thresholds?.lot1 || 15;
  const t2 = thresholds?.lot2 || 30;

  if (occupied < t1) return { name: 'PRIMEIRO', price: lotPrices.lot1 || 110 };
  if (occupied < t2) return { name: 'SEGUNDO', price: lotPrices.lot2 || 130 };
  return { name: 'TERCEIRO', price: lotPrices.lot3 || 150 };
};

// 📊 Consulta o banco e retorna o status completo do evento
async function getEventStatus(excludeRegistrationId = null) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id, payment_status, reserved_until');

  if (error) throw error;

  const occupied = data.filter(r =>
    r.id !== excludeRegistrationId && (
      r.payment_status === 'paid' ||
      (r.payment_status === 'pending' && r.reserved_until && new Date(r.reserved_until) > new Date())
    )
  ).length;

  // 🛡️ BUSCA DINÂMICA DE CONFIGURAÇÕES (Lotes, Capacidade e Taxas)
  let lotPrices = { lot1: 110, lot2: 130, lot3: 150 };
  let lotThresholds = { lot1: 15, lot2: 30 };
  let eventCapacity = MAX_CAPACITY;
  let fees = [{ id: 'insurance', name: 'Seguro Aventura', price: 10.00 }];
  
  try {
    const { data: settings } = await supabase
      .from('event_settings')
      .select('*');

    if (settings) {
      // Preços dos lotes
      const priceSetting = settings.find(s => s.key === 'lot_prices');
      if (priceSetting) lotPrices = priceSetting.value;

      // Limites dos lotes (Quando vira o lote)
      const thresholdSetting = settings.find(s => s.key === 'lot_thresholds');
      if (thresholdSetting) lotThresholds = thresholdSetting.value;

      // Capacidade Total do Evento
      const capacitySetting = settings.find(s => s.key === 'event_capacity');
      if (capacitySetting) eventCapacity = Number(capacitySetting.value);

      // Taxas
      const feeSetting = settings.find(s => s.key === 'fees');
      if (feeSetting) fees = feeSetting.value;
    }
  } catch (err) {
    console.log('💡 Info: Usando valores padrão por falha na busca.');
  }

  const lot = getLotInfo(occupied, lotPrices, lotThresholds);

  return {
    capacity: eventCapacity,
    occupied,
    available: Math.max(0, eventCapacity - occupied),
    is_sold_out: occupied >= eventCapacity,
    currentLot: lot,
    fees
  };
}

module.exports = { getLotInfo, getEventStatus, getConfirmedAthletes };
