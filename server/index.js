const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurações de Segurança (Modo Sênior)
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rota de Teste (Health Check)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Trail Run Club operando!' });
});

// Futura Integração Mercado Pago
// app.use('/api/payments', require('./routes/payments'));

app.listen(PORT, () => {
  console.log(`🚀 Servidor voando na porta ${PORT}`);
});
