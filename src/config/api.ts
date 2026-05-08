// 📡 Configuração Central da API
// Em desenvolvimento: usa o seu IP da rede local para testar no celular
// Em produção: usa a URL do Render.com

const isProduction = import.meta.env.PROD;

// 💡 DICA SÊNIOR: Para testar no celular em casa, troque 'localhost' pelo IP do seu PC (ex: 192.168.1.10)
export const API_URL = isProduction 
  ? 'https://flora-trail-run-api.onrender.com' 
  : 'http://localhost:3001';
