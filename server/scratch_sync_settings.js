const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
  }
);

async function setup() {
  try {
    const settings = [
      { key: 'event_capacity', value: 50, description: 'Capacidade total de inscritos' },
      { key: 'lot_thresholds', value: { lot1: 15, lot2: 30 }, description: 'Limites para virada de lote (inscritos)' }
    ];

    for (const s of settings) {
      const { error } = await supabase
        .from('event_settings')
        .upsert(s, { onConflict: 'key' });
      
      if (error) console.error(`Erro ao inserir ${s.key}:`, error.message);
      else console.log(`✅ Configuração '${s.key}' sincronizada!`);
    }
    
    console.log('\n🍌 BANANAS PROTEGIDAS! Nenhuma inscrição foi tocada.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

setup();
