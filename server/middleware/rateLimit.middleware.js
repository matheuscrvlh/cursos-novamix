const rateLimit = require('express-rate-limit');

// limite geral pra toda /api — não conta o webhook do MP, que não pode
// nunca ser bloqueado (é o próprio Mercado Pago chamando, autenticado por
// assinatura HMAC, não por origem/volume)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.originalUrl.startsWith('/api/pagamentos/webhook'),
});

// login do admin — protege contra brute-force de senha
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

// criação de inscrição / processamento de pagamento — rotas públicas que
// mexem em assento e em dinheiro, mais sensíveis a abuso
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

module.exports = { apiLimiter, loginLimiter, paymentLimiter };
