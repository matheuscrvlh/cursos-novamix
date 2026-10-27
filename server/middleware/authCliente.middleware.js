const jwt = require('jsonwebtoken');
const pool = require('../db');

// Login do cliente é local a este projeto (diferente do admin, que usa SSO
// do hub-novamix) — secret e cookie próprios.
//
// Além da assinatura, confere no banco se a conta continua ativa e se o
// token é da versão atual (token_version). Desativar a conta ou trocar/
// redefinir a senha sobe a versão, e todo token emitido antes para de valer
// na hora — só com a assinatura, quem já estava logado continuava por até 7
// dias (o JWT não tem como ser "recolhido" depois de entregue).
async function verificarSessao(token) {
    let payload;
    try {
        payload = jwt.verify(token, process.env.CLIENTE_JWT_SECRET);
    } catch {
        return null;
    }

    const { rows } = await pool.query(
        `SELECT status, token_version FROM clientes WHERE id = $1`,
        [payload.sub]
    );
    // token emitido antes da coluna token_version existir não tem `tv` —
    // conta como versão 0, pra não deslogar todo mundo no deploy
    if (!rows.length || !rows[0].status || rows[0].token_version !== (payload.tv ?? 0)) {
        return null;
    }
    return payload;
}

async function authenticateCliente(req, res, next) {
    const token = req.cookies?.cliente_token;

    if (!token) {
        return res.status(401).json({ message: 'Não autenticado.' });
    }

    try {
        req.cliente = await verificarSessao(token);
    } catch (err) {
        console.error('Erro ao verificar sessão do cliente:', err);
        return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!req.cliente) {
        return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
    }
    next();
}

// Mesma verificação, mas não bloqueia a requisição sem token/token inválido
// — usado em rotas que funcionam com ou sem login (guest checkout).
async function authenticateClienteOpcional(req, res, next) {
    const token = req.cookies?.cliente_token;
    if (!token) return next();

    try {
        req.cliente = (await verificarSessao(token)) ?? undefined;
    } catch (err) {
        // segue como visitante
        console.error('Erro ao verificar sessão do cliente:', err);
    }
    next();
}

module.exports = { authenticateCliente, authenticateClienteOpcional };
