const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
  }
);

async function run() {
  try {
    console.log('⏳ Atualizando data do evento Trail Run Flona 2026 no Supabase...');
    const { data, error } = await supabase
      .from('events')
      .update({ date: '2026-06-06T07:00:00-03:00' }) // 6 de Junho às 07:00 BRT
      .eq('slug', 'trail-run-flona-2026')
      .select();

    if (error) throw error;
    console.log('🎉 Sucesso! Nova data salva:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Erro ao atualizar data:', err.message);
  }
}

run();
