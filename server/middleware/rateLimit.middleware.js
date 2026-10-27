const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// tráfego de produção sempre chega via nginx (trust proxy 1, ver server.js)
// — uma requisição com IP de loopback só acontece testando local, nunca é
// tráfego real. Isso evita bater no limite geral em dev, onde o StrictMode
// do React dispara cada efeito duas vezes e recarregar a página várias vezes
// debugando soma requisições rápido.
// Só vale fora de produção: o IP vem do X-Forwarded-For, que quem chegasse
// direto na porta do backend poderia preencher com "127.0.0.1" pra escapar
// de todos os limites.
const isLoopback = ip => ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
const isLoopbackDev = ip => process.env.NODE_ENV !== 'production' && isLoopback(ip);

// limite geral pra toda /api — não conta o webhook do MP, que não pode
// nunca ser bloqueado (é o próprio Mercado Pago chamando, autenticado por
// assinatura HMAC, não por origem/volume)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.originalUrl.startsWith('/api/pagamentos/webhook') || isLoopbackDev(req.ip),
});

// login/senha de cliente — protege contra brute-force de senha ou token de
// redefinição. Mantido restrito mesmo compartilhando IP (loja com wifi único,
// CGNAT de operadora): o risco aqui é alguém adivinhando credencial alheia,
// não múltiplos clientes legítimos usando a rota ao mesmo tempo.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

// cadastro de cliente — separado do loginLimiter porque aqui não tem
// credencial alheia pra "adivinhar" (cada tentativa cria uma conta nova ou
// falha por e-mail/CPF já usado), então o limite pode ser bem mais folgado.
// Isso importa principalmente pro caso comum de vários clientes diferentes
// se cadastrando atrás do mesmo IP (wifi da loja, CGNAT de operadora) — com
// o limite de login (10/15min) isso esgotava rápido e travava todo mundo.
const cadastroLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de cadastro. Tente novamente em alguns minutos.' },
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

// reserva de assento, por IP *em cada curso* (o paymentLimiter acima é por IP
// no geral). Cada inscrição pendente segura o assento por 30min (ver
// utils/expirarReservas.js), então só com o limite geral um único IP
// conseguia segurar ~60 assentos ao mesmo tempo — mais que a lotação de um
// curso (20 a 24). 8 por curso cobre uma família comprando junto e quem fecha
// e reabre o modal algumas vezes, e obriga quem quiser lotar um curso de
// mentira a usar vários IPs. Limitar por CPF não serviria: CPF válido se gera
// à vontade, e bloquear por CPF deixaria alguém travar a reserva de outra
// pessoa só digitando o CPF dela.
const RESERVAS_POR_CURSO = 8;
const reservaLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: RESERVAS_POR_CURSO,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => `${ipKeyGenerator(req.ip)}:${req.body?.cursoId}`,
  skip: req => isLoopbackDev(req.ip),
  message: { message: 'Muitas reservas para este curso a partir da sua conexão. Tente novamente em alguns minutos.' },
});

module.exports = { apiLimiter, loginLimiter, cadastroLimiter, paymentLimiter, reservaLimiter };
