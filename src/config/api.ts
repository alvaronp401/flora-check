// 📡 Configuração Central da API
// Prioriza a variável de ambiente VITE_API_URL (definida no .env do servidor)
// Se não houver, usa o localhost como fallback

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
