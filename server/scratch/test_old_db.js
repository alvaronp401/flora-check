const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL || '';
const OLD_SUPABASE_KEY = process.env.OLD_SUPABASE_KEY || '';

const supabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function test() {
  try {
    const { data, error } = await supabase.from('registrations').select('*');
    if (error) throw error;
    console.log('✅ Success! Count:', data.length);
    console.log('Sample names:', data.slice(0, 3).map(r => r.full_name));
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

test();
