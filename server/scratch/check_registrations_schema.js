const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const NEW_SUPABASE_URL = process.env.SUPABASE_URL;
const NEW_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function checkSchema() {
  try {
    const { data, error } = await supabase.from('registrations').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Columns in registrations:', data.length > 0 ? Object.keys(data[0]) : 'No rows found');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkSchema();
