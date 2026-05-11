const { supabase, MAX_CAPACITY } = require('../config/clients');

// 🎫 Lógica de Lotes: retorna nome e preço baseado na ocupação atual
const getLotInfo = (occupied, lotPrices = { lot1: 110, lot2: 130, lot3: 150 }) => {
  if (occupied < 15) return { name: 'PRIMEIRO', price: lotPrices.lot1 || 110 };
  if (occupied < 30) return { name: 'SEGUNDO', price: lotPrices.lot2 || 130 };
  return { name: 'TERCEIRO', price: lotPrices.lot3 || 150 };
};

// 📊 Consulta o banco e retorna o status completo do evento
async function getEventStatus() {
  const { data, error } = await supabase
    .from('registrations')
    .select('payment_status, reserved_until');

  if (error) throw error;

  const occupied = data.filter(r =>
    r.payment_status === 'paid' ||
    (r.payment_status === 'pending' && r.reserved_until && new Date(r.reserved_until) > new Date())
  ).length;

  // 🛡️ BUSCA DINÂMICA DE CONFIGURAÇÕES (Lotes e Taxas)
  let lotPrices = { lot1: 110, lot2: 130, lot3: 150 };
  let fees = [{ id: 'insurance', name: 'Seguro Aventura', price: 10.00 }];
  
  try {
    const { data: settings } = await supabase
      .from('event_settings')
      .select('*');

    if (settings) {
      const priceSetting = settings.find(s => s.key === 'lot_prices');
      if (priceSetting) lotPrices = priceSetting.value;

      const feeSetting = settings.find(s => s.key === 'fees');
      if (feeSetting) fees = feeSetting.value;
    }
  } catch (err) {
    console.log('💡 Info: Usando valores padrão.');
  }

  const lot = getLotInfo(occupied, lotPrices);

  return {
    capacity: MAX_CAPACITY,
    occupied,
    available: Math.max(0, MAX_CAPACITY - occupied),
    is_sold_out: occupied >= MAX_CAPACITY,
    currentLot: lot,
    fees
  };
}

module.exports = { getLotInfo, getEventStatus };
