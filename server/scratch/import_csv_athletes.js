const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const NEW_SUPABASE_URL = process.env.SUPABASE_URL;
const NEW_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_EVENT_ID = 'e0123456-789a-bcde-f012-3456789abcde';
const CSV_PATH = 'C:\\Users\\alvar\\Downloads\\inscritos_flona_2026_2026-05-31 (1).csv';

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

function parseCSVLine(line) {
  // Separa por ponto e vírgula, limpando as aspas duplas de cada campo
  return line.split(';').map(field => {
    let clean = field.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1);
    }
    return clean;
  });
}

async function importAthletes() {
  try {
    console.log('⏳ 1. Lendo arquivo CSV de atletas exportados...');
    const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = fileContent.split('\n').map(l => l.trim()).filter(Boolean);

    // Ignora a linha 1 (sep=;) e a linha 2 (cabeçalho)
    const dataLines = lines.slice(2);
    console.log(`✅ Lidas ${dataLines.length} linhas de atletas do CSV.`);

    const athletesToInsert = [];

    for (const line of dataLines) {
      const columns = parseCSVLine(line);
      if (columns.length < 10) continue;

      const [
        nome,
        email,
        cpf,
        telefone,
        genero,
        camiseta,
        tipoSanguineo,
        medicamentos,
        emergencia,
        status
      ] = columns;

      athletesToInsert.push({
        full_name: nome,
        email: email,
        cpf: cpf,
        phone: telefone,
        gender: genero || 'Masculino',
        shirt_size: camiseta || 'M',
        blood_type: tipoSanguineo || 'A+',
        medication: medicamentos === 'Nenhum' || medicamentos === 'Não' ? '' : medicamentos,
        emergency_phone: emergencia || '',
        payment_status: status.toLowerCase() === 'paid' ? 'paid' : 'pending',
        reserved_until: '2099-12-31T23:59:59Z', // Vital para não expirar
        final_price: 110.00,
        event_id: DEFAULT_EVENT_ID
      });
    }

    console.log(`⏳ 2. Limpando TODAS as inscrições antigas do banco novo para evitar duplicidade...`);
    const { error: deleteErr } = await supabase
      .from('registrations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Apaga tudo

    if (deleteErr) throw deleteErr;
    console.log('✅ Banco novo limpo.');

    console.log(`⏳ 3. Inserindo os ${athletesToInsert.length} atletas reais no novo Supabase...`);
    const { data: insertedData, error: insertErr } = await supabase
      .from('registrations')
      .insert(athletesToInsert)
      .select();

    if (insertErr) throw insertErr;
    console.log(`🎉 Sucesso! ${athletesToInsert.length} atletas reais foram importados para o novo Supabase!`);
    console.log('A listagem agora deve carregar os nomes reais e o status deve ficar ESGOTADO.');

  } catch (err) {
    console.error('❌ Erro na importação:', err.message);
  }
}

importAthletes();
