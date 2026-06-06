const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 🛡️ Conexões dos Bancos de Dados (via .env - NUNCA hardcode secrets!)
const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL || '';
const OLD_SUPABASE_KEY = process.env.OLD_SUPABASE_KEY || '';

const NEW_SUPABASE_URL = process.env.SUPABASE_URL;
const NEW_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DEFAULT_EVENT_ID = 'e0123456-789a-bcde-f012-3456789abcde';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function migrate() {
  try {
    console.log('⏳ 1. Buscando atletas reais do banco de dados antigo...');
    const { data: oldRegs, error: oldErr } = await oldSupabase
      .from('registrations')
      .select('*');

    if (oldErr) throw oldErr;
    console.log(`✅ Encontrados ${oldRegs.length} atletas no banco antigo.`);

    console.log('⏳ 2. Limpando atletas de teste (ATLETA TESTE) do banco novo...');
    const { error: deleteErr } = await newSupabase
      .from('registrations')
      .delete()
      .like('full_name', 'ATLETA TESTE%');

    if (deleteErr) throw deleteErr;
    console.log('✅ Atletas de teste removidos do banco novo.');

    console.log('⏳ 3. Migrando atletas reais para o banco novo...');
    
    // Mapeia os atletas associando-os ao evento padrão
    const mappedRegs = oldRegs.map(r => ({
      id: r.id,
      full_name: r.full_name,
      cpf: r.cpf,
      email: r.email,
      phone: r.phone,
      emergency_phone: r.emergency_phone,
      blood_type: r.blood_type,
      medication: r.medication,
      gender: r.gender,
      shirt_size: r.shirt_size,
      payment_status: r.payment_status,
      reserved_until: r.reserved_until,
      final_price: r.final_price,
      coupon_code: r.coupon_code,
      created_at: r.created_at,
      event_id: DEFAULT_EVENT_ID // Vincula ao Trail Run Flona 2026
    }));

    // Insere os dados em lotes no novo banco
    // Usamos ON CONFLICT para não duplicar se o script for rodado novamente
    const { data: insertedData, error: insertErr } = await newSupabase
      .from('registrations')
      .upsert(mappedRegs, { onConflict: 'id' });

    if (insertErr) throw insertErr;
    console.log(`🎉 Sucesso! ${mappedRegs.length} atletas reais migrados para o novo Supabase.`);

  } catch (err) {
    console.error('❌ Falha na migração:', err.message);
  }
}

migrate();
