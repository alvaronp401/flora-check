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
    const { data: events, error: eventErr } = await supabase.from('events').select('*');
    if (eventErr) throw eventErr;
    console.log('--- EVENTS ---');
    console.log(JSON.stringify(events, null, 2));

    const { data: regs, error: regErr } = await supabase
      .from('registrations')
      .select('id, full_name, event_id, payment_status');
    if (regErr) throw regErr;

    console.log('\n--- REGISTRATIONS COUNT ---', regs.length);
    console.log('Sample registrations:', regs.slice(0, 5));
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
