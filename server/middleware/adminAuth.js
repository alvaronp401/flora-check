const { supabase } = require('../config/clients');

// 🛡️ Middleware: Validação Dupla (Chave Secreta + Sessão Supabase)
const adminAuth = async (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  const authHeader = req.headers['authorization'];

  try {
    // 1. Verifica a Chave Secreta (Configurada no .env)
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Acesso negado! Chave mestra inválida.' });
    }

    // 2. Verifica se o usuário está logado no Supabase
    if (!authHeader) {
      return res.status(401).json({ error: 'Sessão administrativa exigida.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
    }

    // Se passou por tudo, injeta o user no request para uso futuro e segue
    req.adminUser = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro interno na validação de acesso.' });
  }
};

module.exports = { adminAuth };
