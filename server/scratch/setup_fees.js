const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupSettingsTable() {
  console.log('🚀 Iniciando configuração da tabela de taxas...');

  // 1. Cria a tabela de taxas se ela não existir
  // Nota: Em um ambiente real, você faria isso via Dashboard do Supabase.
  // Aqui, vamos apenas garantir que o valor exista para o backend ler.
  
  const { data, error } = await supabase
    .from('event_settings')
    .select('*')
    .eq('key', 'insurance_fee')
    .single();

  if (error && error.code === 'PGRST116') {
    console.log('💡 Criando configuração inicial do seguro...');
    const { error: insertError } = await supabase
      .from('event_settings')
      .insert([
        { 
          key: 'insurance_fee', 
          value: { name: 'Seguro Aventura', price: 5.00 },
          description: 'Taxa obrigatória de seguro para todos os atletas'
        }
      ]);
    
    if (insertError) console.error('❌ Erro ao criar taxa:', insertError);
    else console.log('✅ Taxa de R$ 5,00 criada com sucesso!');
  } else {
    console.log('✅ Taxa já existe:', data.value);
  }
}

setupSettingsTable();
