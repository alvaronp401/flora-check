const { supabase, MAX_CAPACITY } = require('../config/clients');

// 🎫 Lógica de Lotes: retorna nome e preço baseado na ocupação atual
const getLotInfo = (occupied) => {
  if (occupied < 15) return { name: 'PRIMEIRO', price: 110 };
  if (occupied < 30) return { name: 'SEGUNDO', price: 120 };
  return { name: 'TERCEIRO', price: 130 };
};

// 📊 Consulta o banco e retorna o status completo do evento
async function getEventStatus() {
  const { data, error } = await supabase
    .from('registrations')
    .select('payment_status, reserved_until');

  if (error) throw error;

  // Conta vagas ocupadas: pagas OU reservadas ainda dentro do prazo
  const occupied = data.filter(r =>
    r.payment_status === 'paid' ||
    (r.payment_status === 'pending' && r.reserved_until && new Date(r.reserved_until) > new Date())
  ).length;

  const lot = getLotInfo(occupied);

  // 🛡️ BUSCA DINÂMICA DE TAXAS (Com Fallback de Segurança)
  let fees = [{ id: 'insurance', name: 'Seguro Aventura', price: 5.00 }];
  
  try {
    const { data: settings } = await supabase
      .from('event_settings')
      .select('value')
      .eq('key', 'insurance_fee')
      .single();

    if (settings?.value) {
      fees = [{ 
        id: 'insurance', 
        name: settings.value.name, 
        price: Number(settings.value.price) 
      }];
    }
  } catch (err) {
    // Se a tabela não existir ainda, o 'fees' continua com o valor padrão de R$ 5.00
    console.log('💡 Info: Usando taxas padrão (tabela event_settings ainda não criada)');
  }

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
