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

async function check() {
  try {
    const { data, error } = await supabase.from('event_settings').select('*');
    if (error) throw error;
    console.log('--- EVENT SETTINGS ---');
    console.log(JSON.stringify(data, null, 2));
    
    // Contagem manual de ocupados para comparar com a lógica do site
    const { data: regs, error: regErr } = await supabase
      .from('registrations')
      .select('payment_status, reserved_until');
    
    if (regErr) throw regErr;

    const now = new Date();
    const paid = regs.filter(r => r.payment_status === 'paid').length;
    const pending = regs.filter(r => 
      r.payment_status === 'pending' && 
      r.reserved_until && 
      new Date(r.reserved_until) > now
    ).length;

    console.log('\n--- REAL TIME STATS ---');
    console.log('Total Paid:', paid);
    console.log('Total Pending (Active):', pending);
    console.log('Total Occupied (Paid + Pending):', paid + pending);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
