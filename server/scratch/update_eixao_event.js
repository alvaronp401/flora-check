const fs = require('fs');
require('dotenv').config({ path: '../.env' }); // Carrega o .env da pasta server

// 1. Inicializa credenciais do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY faltando.");
  process.exit(1);
}

async function run() {
  console.log("Iniciando Migration (Atualização Sênior via REST) do Evento Eixão Sul...");

  const slug = 'alongamento-corrida-eixao-sul';
  
  // 2. Busca o evento usando a REST API do Supabase
  const getUrl = `${supabaseUrl}/rest/v1/events?slug=eq.${slug}&select=id,title`;
  const getRes = await fetch(getUrl, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const events = await getRes.json();
  
  if (!events || events.length === 0) {
    console.error(`Erro: Evento não encontrado pelo slug '${slug}'.`);
    process.exit(1);
  }

  const event = events[0];
  console.log(`Evento Encontrado: ${event.title} (ID: ${event.id})`);

  // 3. Monta o Payload para a regra de negócio
  const updatePayload = {
    capacity: 30,
    lot_prices: { lot1: 30, lot2: 35 },
    lot_thresholds: { lot1: 15, lot2: 30 },
  };

  // 4. Faz o Update
  const patchUrl = `${supabaseUrl}/rest/v1/events?id=eq.${event.id}`;
  const patchRes = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updatePayload)
  });

  if (!patchRes.ok) {
    const errorText = await patchRes.text();
    console.error("Erro ao atualizar os dados do evento:", errorText);
    process.exit(1);
  }

  console.log("✅ Evento Eixão Sul configurado com sucesso para as novas regras de Vagas e Lotes.");
  console.log(JSON.stringify(updatePayload, null, 2));
}

run();
