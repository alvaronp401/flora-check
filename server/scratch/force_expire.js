require('dotenv').config({ path: './server/.env' });
const { supabase } = require('../config/clients');

async function forceExpireLastRegistration() {
  // 1. Busca a última inscrição pendente
  const { data: reg, error: fetchError } = await supabase
    .from('registrations')
    .select('id, full_name')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !reg) {
    console.log('❌ Nenhuma inscrição pendente encontrada para expirar.');
    return;
  }

  // 2. Coloca o tempo de expiração para 1 hora atrás
  const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from('registrations')
    .update({ reserved_until: pastDate })
    .eq('id', reg.id);

  if (updateError) {
    console.error('Erro ao atualizar:', updateError);
  } else {
    console.log(`✅ SUCESSO! A reserva de "${reg.full_name}" foi expirada manualmente.`);
    console.log(`🚀 Agora verifique o Dashboard ou rode o audit_reservations.js para ver a vaga livre!`);
  }
}

forceExpireLastRegistration();
