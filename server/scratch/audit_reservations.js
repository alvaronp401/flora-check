require('dotenv').config({ path: './server/.env' });
const { supabase } = require('../config/clients');

async function checkExpirations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('full_name, payment_status, reserved_until, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log('\n📋 LISTA DE INSCRIÇÕES E STATUS DE RESERVA:');
  console.log('-------------------------------------------');
  
  const now = new Date();
  
  data.forEach(r => {
    const expiry = r.reserved_until ? new Date(r.reserved_until) : null;
    const isExpired = expiry && expiry < now;
    const status = r.payment_status === 'paid' ? '✅ PAGO' : (isExpired ? '❌ EXPIRADO' : '⏳ ATIVO/PENDENTE');
    
    console.log(`👤 ${r.full_name.padEnd(25)} | Status: ${status.padEnd(15)} | Expira em: ${r.reserved_until || 'N/A'}`);
  });

  const occupied = data.filter(r => 
    r.payment_status === 'paid' || 
    (r.payment_status === 'pending' && r.reserved_until && new Date(r.reserved_until) > now)
  ).length;

  console.log('-------------------------------------------');
  console.log(`📊 Vagas Ocupadas Reais: ${occupied} / 50\n`);
}

checkExpirations();
