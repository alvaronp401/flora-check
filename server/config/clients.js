const { MercadoPagoConfig } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config();

// 🛡️ Configuração Supabase (Admin - Service Role)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
  }
);

// 💳 Configuração MercadoPago
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

// 🚀 Constantes do Evento
const MAX_CAPACITY = 50;

module.exports = { supabase, mpClient, MAX_CAPACITY };
