const rateLimit = require('express-rate-limit');

// 🛡️ Segurança: Limite de requisições Global (Prevenção de DoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 2000, // Limite aumentado para evitar bloqueios no polling do frontend
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 💰 Segurança: Limite Restrito para Pagamentos e Cupons (Prevenção de Brute Force)
const sensitiveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Aumentei para 10 para evitar bloqueios injustos em rede compartilhada
  message: { error: 'Limite de tentativas atingido. Aguarde 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, sensitiveLimiter };
