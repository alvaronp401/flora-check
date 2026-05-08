// 🛡️ Middleware: Valida a chave secreta de Admin em todas as rotas protegidas
// Uso: app.post('/rota', adminAuth, async (req, res) => { ... })
const adminAuth = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Acesso negado! Chave inválida.' });
  }
  next();
};

module.exports = { adminAuth };
