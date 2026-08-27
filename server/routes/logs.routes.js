const express = require('express');
const pool = require('../db');
const { authenticate, requireCursosAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Auditoria das ações administrativas (cursos.logs, ver utils/logAudit.js) —
// tela restrita a admin do módulo 'cursos' (requireCursosAdmin), não só quem
// tem acesso de leitura ao módulo.
router.get('/', authenticate, requireCursosAdmin, async (req, res) => {
    const { tipoEntidade, acao, dataInicio, dataFim, busca } = req.query;
    const condicoes = [];
    const valores = [];

    if (tipoEntidade) {
        valores.push(tipoEntidade);
        condicoes.push(`l.tipo_entidade = $${valores.length}`);
    }
    if (acao) {
        valores.push(acao);
        condicoes.push(`l.acao = $${valores.length}`);
    }
    if (dataInicio) {
        valores.push(dataInicio);
        condicoes.push(`l.criado_em >= $${valores.length}`);
    }
    if (dataFim) {
        valores.push(dataFim);
        condicoes.push(`l.criado_em < $${valores.length}`);
    }
    if (busca && busca.trim()) {
        valores.push(`%${busca.trim()}%`);
        condicoes.push(`(l.entidade_id ILIKE $${valores.length} OR l.detalhes ILIKE $${valores.length})`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    try {
        // logs só cresce (auditoria nunca é podada) — LIMIT evita puxar a
        // tabela inteira quando os filtros vêm vazios (mesmo problema já
        // visto na lista de clientes). usuario_hub_id é public.users.id (hub
        // SSO, outro projeto) — LEFT JOIN pra trazer o nome já resolvido
        // sem quebrar logs antigos sem usuário associado (ação do sistema)
        const { rows } = await pool.query(`
            SELECT l.id, l.tipo_entidade AS "tipoEntidade", l.entidade_id AS "entidadeId",
                   l.acao, l.detalhes, l.usuario_hub_id AS "usuarioHubId", u.name AS "usuarioNome",
                   l.criado_em AS "criadoEm"
            FROM logs l
            LEFT JOIN public.users u ON u.id = l.usuario_hub_id
            ${where}
            ORDER BY l.criado_em DESC
            LIMIT 500
        `, valores);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar logs:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// Valores distintos já gravados, pra popular os filtros sem precisar
// hardcodar no front (evita a lista desatualizar se um novo tipo/ação
// aparecer numa rota nova que ainda não existia quando a tela foi feita)
router.get('/tipos', authenticate, requireCursosAdmin, async (req, res) => {
    try {
        const [tipos, acoes] = await Promise.all([
            pool.query(`SELECT DISTINCT tipo_entidade FROM logs ORDER BY tipo_entidade`),
            pool.query(`SELECT DISTINCT acao FROM logs ORDER BY acao`),
        ]);
        res.json({
            tiposEntidade: tipos.rows.map(r => r.tipo_entidade),
            acoes: acoes.rows.map(r => r.acao),
        });
    } catch (err) {
        console.error('Erro ao listar tipos de log:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

module.exports = router;
