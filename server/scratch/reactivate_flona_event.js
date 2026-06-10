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
    console.log('⏳ Reativando o evento Flona 12km (slug: flona-12km) no banco de dados...');
    const { data, error } = await supabase
      .from('events')
      .update({ is_active: true })
      .eq('slug', 'flona-12km')
      .select();

    if (error) throw error;
    console.log('🎉 Sucesso! Evento reativado no Supabase:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Erro ao reativar evento:', err.message);
  }
}

run();
