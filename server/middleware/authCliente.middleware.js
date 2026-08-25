const jwt = require('jsonwebtoken');

// Login do cliente é local a este projeto (diferente do admin, que usa SSO
// do hub-novamix) — secret e cookie próprios.
function authenticateCliente(req, res, next) {
    const token = req.cookies?.cliente_token;

    if (!token) {
        return res.status(401).json({ message: 'Não autenticado.' });
    }

    try {
        req.cliente = jwt.verify(token, process.env.CLIENTE_JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
    }
}

// Mesma verificação, mas não bloqueia a requisição sem token/token inválido
// — usado em rotas que funcionam com ou sem login (guest checkout).
function authenticateClienteOpcional(req, res, next) {
    const token = req.cookies?.cliente_token;
    if (!token) return next();

    try {
        req.cliente = jwt.verify(token, process.env.CLIENTE_JWT_SECRET);
    } catch {
        // segue como visitante
    }
    next();
}

module.exports = { authenticateCliente, authenticateClienteOpcional };
