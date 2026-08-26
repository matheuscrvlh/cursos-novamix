const jwt = require('jsonwebtoken');

const MODULO = 'cursos';

// Login é centralizado no hub-novamix — o token vem por cookie httpOnly
// compartilhado em .lojanovamix.com.br (mesmo JWT_SECRET dos dois projetos),
// com fallback pro header Authorization pra chamadas manuais/teste.
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = req.cookies?.token ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader);

    if (!token) {
        return res.status(401).json({ error: 'Autorização não encontrada.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
}

// Exige que o usuário tenha alguma permissão pro módulo 'cursos' (read ou
// admin) — usado nas rotas de leitura autenticada (listas de inscrição etc.)
function requireCursosAccess(req, res, next) {
    const permissao = req.user?.permissions?.find(p => p.module === MODULO);

    if (!permissao) {
        return res.status(403).json({ error: 'Módulo não liberado para esse usuário.' });
    }

    req.cursosAccess = permissao.access;
    next();
}

// Exige access === 'admin' na permissão do módulo 'cursos' (não o role
// global do hub-novamix) — usado nas ações administrativas sensíveis
// (excluir curso/inscrição/culinarista/indústria/banner, reembolsar).
// Qualquer usuário com acesso ao módulo 'cursos' já pode fazer o resto (ver
// requireCursosAccess); isso aqui é a exceção, não o nível "normal" de
// escrita. Checar req.user.role travava usuários que são admin só do módulo
// cursos (e não admin do hub como um todo), e liberava admins do hub sem
// permissão de admin nesse módulo especificamente.
function requireCursosAdmin(req, res, next) {
    const permissao = req.user?.permissions?.find(p => p.module === MODULO);

    if (!permissao) {
        return res.status(403).json({ error: 'Módulo não liberado para esse usuário.' });
    }
    if (permissao.access !== 'admin') {
        return res.status(403).json({ error: 'Ação restrita a administradores.' });
    }

    req.cursosAccess = permissao.access;
    next();
}

module.exports = { authenticate, requireCursosAccess, requireCursosAdmin };
