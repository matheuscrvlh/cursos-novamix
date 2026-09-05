const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { authenticateCliente } = require('../middleware/authCliente.middleware');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const { loginLimiter, cadastroLimiter } = require('../middleware/rateLimit.middleware');
const { cpfValido } = require('../utils/cpf');
const { encryptCpf, decryptCpf } = require('../utils/cpfCrypto');
const { enviarEmail, emailRedefinirSenha } = require('../utils/email');
const logAudit = require('../utils/logAudit');

const router = express.Router();

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
};

function assinarToken(cliente) {
    return jwt.sign(
        { sub: cliente.id, nome: cliente.nome, email: cliente.email },
        process.env.CLIENTE_JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

// loja (texto "Prado"/"Teresopolis", mesmo contrato que cursos/culinaristas já
// usam) resolve pro filial_id de public.branchs (nome real é "Novamix Prado" etc.)
async function resolverFilialId(loja) {
    if (!loja) return null;
    const { rows } = await pool.query(
        `SELECT id FROM public.branchs WHERE name ILIKE '%' || $1 || '%' LIMIT 1`,
        [loja]
    );
    return rows[0]?.id ?? null;
}

// devolve só os campos seguros de expor (nunca senha_hash). cpf vem cifrado
// do banco (ver utils/cpfCrypto.js) — decifra aqui, só na borda de saída.
function serializarCliente(c) {
    return {
        id: c.id,
        nome: c.nome,
        email: c.email,
        cpf: decryptCpf(c.cpf),
        celular: c.celular,
        loja: c.loja ?? null,
        criadoEm: c.criado_em,
    };
}

router.post('/cadastro', cadastroLimiter, async (req, res) => {
    const { nome, email, senha, cpf, celular, loja } = req.body;

    if (!nome?.trim() || !emailValido(email) || !senha || senha.length < 6) {
        return res.status(400).json({ message: 'Nome, e-mail válido e senha (mínimo 6 caracteres) são obrigatórios.' });
    }
    const cpfDigits = (cpf || '').replace(/\D/g, '');
    if (cpf && !cpfValido(cpfDigits)) {
        return res.status(400).json({ message: 'CPF inválido.' });
    }

    try {
        // cifra antes de comparar/gravar — a cifra é determinística (mesmo
        // CPF sempre gera o mesmo texto cifrado), então a comparação por
        // igualdade aqui e o UNIQUE no banco continuam funcionando iguais
        const cpfCifrado = cpf ? encryptCpf(cpfDigits) : null;

        const { rows: existentes } = await pool.query(
            `SELECT id FROM clientes WHERE email = $1 OR (cpf IS NOT NULL AND cpf = $2)`,
            [email.toLowerCase(), cpfCifrado]
        );
        if (existentes.length) {
            return res.status(409).json({ message: 'Já existe uma conta com esse e-mail ou CPF.' });
        }

        const id = uuidv4();
        const senhaHash = await bcrypt.hash(senha, 10);
        const filialId = await resolverFilialId(loja);

        // CTE porque RETURNING sozinho não faz JOIN — precisa do nome da loja
        // (não só o id) pra devolver no mesmo formato "Prado"/"Teresopolis"
        // que o resto do frontend já usa como filtro
        const { rows } = await pool.query(`
            WITH novo AS (
                INSERT INTO clientes (id, nome, email, senha_hash, cpf, celular, filial_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, nome, email, cpf, celular, criado_em, filial_id
            )
            SELECT novo.*, REPLACE(b.name, 'Novamix ', '') AS loja
            FROM novo LEFT JOIN public.branchs b ON b.id = novo.filial_id
        `, [id, nome.trim(), email.toLowerCase(), senhaHash, cpfCifrado, celular || null, filialId]);

        const cliente = rows[0];
        res.cookie('cliente_token', assinarToken(cliente), { ...COOKIE_OPTS, maxAge: SETE_DIAS_MS });
        res.status(201).json(serializarCliente(cliente));
    } catch (err) {
        // a checagem acima (SELECT) não é atômica com o INSERT — duas
        // requisições simultâneas com o mesmo e-mail/CPF (duplo clique, duas
        // abas) podem ambas passar pelo SELECT antes de qualquer INSERT
        // acontecer; a constraint UNIQUE pega isso, só precisa virar a
        // mensagem certa em vez de um 500 genérico
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Já existe uma conta com esse e-mail ou CPF.' });
        }
        console.error('Erro ao cadastrar cliente:', err);
        res.status(500).json({ message: 'Erro ao criar conta.' });
    }
});

router.post('/login', loginLimiter, async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const { rows } = await pool.query(`
            SELECT c.*, REPLACE(b.name, 'Novamix ', '') AS loja
            FROM clientes c LEFT JOIN public.branchs b ON b.id = c.filial_id
            WHERE c.email = $1
        `, [email.toLowerCase()]);
        const cliente = rows[0];

        // mesma mensagem genérica pra "não existe" e "senha errada" — não dá
        // pra um invasor descobrir se um e-mail está cadastrado por tentativa
        if (!cliente || !(await bcrypt.compare(senha, cliente.senha_hash))) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
        if (!cliente.status) {
            return res.status(403).json({ message: 'Conta desativada. Entre em contato com o suporte.' });
        }

        await pool.query(`UPDATE clientes SET ultimo_login = now() WHERE id = $1`, [cliente.id]);

        res.cookie('cliente_token', assinarToken(cliente), { ...COOKIE_OPTS, maxAge: SETE_DIAS_MS });
        res.json(serializarCliente(cliente));
    } catch (err) {
        console.error('Erro ao logar cliente:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('cliente_token', COOKIE_OPTS);
    res.json({ message: 'Sessão encerrada.' });
});

router.get('/me', authenticateCliente, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT c.*, REPLACE(b.name, 'Novamix ', '') AS loja
            FROM clientes c LEFT JOIN public.branchs b ON b.id = c.filial_id
            WHERE c.id = $1
        `, [req.cliente.sub]);
        if (!rows.length) return res.status(404).json({ message: 'Conta não encontrada.' });
        res.json(serializarCliente(rows[0]));
    } catch (err) {
        res.status(500).json({ message: 'Erro interno.' });
    }
});

router.put('/me', authenticateCliente, async (req, res) => {
    const { nome, celular, loja } = req.body;
    try {
        // loja informada: sempre atualiza (mesmo que resolverFilialId não
        // encontre nada, vira null); não informada: mantém a atual — mesmo
        // padrão de CASE WHEN que cursos.routes.js já usa pra campo opcional
        const lojaInformada = loja !== undefined;
        const filialId = lojaInformada ? await resolverFilialId(loja) : null;

        const { rows } = await pool.query(`
            WITH atualizado AS (
                UPDATE clientes SET
                    nome      = COALESCE($1, nome),
                    celular   = COALESCE($2, celular),
                    filial_id = CASE WHEN $4 THEN $5 ELSE filial_id END
                WHERE id = $3
                RETURNING id, nome, email, cpf, celular, criado_em, filial_id
            )
            SELECT atualizado.*, REPLACE(b.name, 'Novamix ', '') AS loja
            FROM atualizado LEFT JOIN public.branchs b ON b.id = atualizado.filial_id
        `, [nome?.trim() || null, celular ?? null, req.cliente.sub, lojaInformada, filialId]);
        // conta pode ter sido excluída pelo admin enquanto o token (7 dias)
        // ainda era válido — sem essa checagem, serializarCliente(undefined) quebra
        if (!rows.length) return res.status(401).json({ message: 'Conta não encontrada.' });
        res.json(serializarCliente(rows[0]));
    } catch (err) {
        console.error('Erro ao atualizar cliente:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// Troca de senha com o cliente já logado — exige a senha atual mesmo assim
// (sessão de 7 dias pode estar aberta num dispositivo compartilhado; sem essa
// checagem, quem tiver acesso ao navegador trocaria a senha sem saber a
// antiga e tomaria a conta). loginLimiter reaproveitado aqui pelo mesmo
// motivo do login: limita tentativas de adivinhar a senha atual.
router.post('/alterar-senha', authenticateCliente, loginLimiter, async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
        return res.status(400).json({ message: 'Senha atual e nova senha (mínimo 6 caracteres) são obrigatórias.' });
    }

    try {
        const { rows } = await pool.query(`SELECT senha_hash FROM clientes WHERE id = $1`, [req.cliente.sub]);
        if (!rows.length) return res.status(404).json({ message: 'Conta não encontrada.' });

        if (!(await bcrypt.compare(senhaAtual, rows[0].senha_hash))) {
            return res.status(401).json({ message: 'Senha atual incorreta.' });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await pool.query(`UPDATE clientes SET senha_hash = $1 WHERE id = $2`, [novaSenhaHash, req.cliente.sub]);

        res.json({ message: 'Senha alterada com sucesso.' });
    } catch (err) {
        console.error('Erro ao alterar senha:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// "Minha conta" — lista as inscrições feitas por essa conta (cliente_id),
// com o nome do curso já resolvido (sobrevive à exclusão do curso via
// curso_removido_nome, igual o admin já usa)
router.get('/minhas-inscricoes', authenticateCliente, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                i.id,
                i.assento,
                i.status,
                i.data_inscricao AS "dataInscricao",
                COALESCE(c.nome_curso, i.curso_removido_nome) AS "nomeCurso",
                to_char(c.data, 'YYYY-MM-DD') AS "dataCurso",
                to_char(c.data, 'HH24:MI') AS "horaCurso",
                c.id AS "cursoId"
            FROM inscricoes i
            LEFT JOIN cursos c ON c.id = i.curso_id
            WHERE i.cliente_id = $1
            ORDER BY i.data_inscricao DESC
        `, [req.cliente.sub]);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar inscrições do cliente:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// Fluxo de redefinição de senha em duas etapas.
router.post('/esqueci-senha', loginLimiter, async (req, res) => {
    const { email } = req.body;
    if (!emailValido(email)) return res.status(400).json({ message: 'E-mail inválido.' });

    try {
        const { rows } = await pool.query(`SELECT id, nome FROM clientes WHERE email = $1`, [email.toLowerCase()]);

        // mensagem igual exista ou não a conta — não dá pra vazar quais
        // e-mails estão cadastrados
        const respostaGenerica = { message: 'Se existir uma conta com esse e-mail, enviaremos as instruções de redefinição.' };

        if (!rows.length) return res.json(respostaGenerica);

        const token = uuidv4();
        await pool.query(`
            INSERT INTO clientes_tokens (id, cliente_id, token, tipo, expira_em)
            VALUES ($1, $2, $3, 'redefinir_senha', now() + interval '1 hour')
        `, [uuidv4(), rows[0].id, token]);

        res.json(respostaGenerica);

        const { subject, html } = emailRedefinirSenha({ nome: rows[0].nome, token });
        enviarEmail({ to: email.toLowerCase(), subject, html });
    } catch (err) {
        console.error('Erro ao gerar token de redefinição de senha:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// Checa se o token ainda é válido sem consumi-lo — a tela de redefinição usa
// isso pra já mostrar o erro ao abrir o link (token repetido/expirado), sem
// esperar o cliente digitar a senha nova e só então descobrir pelo POST.
router.get('/redefinir-senha/:token', loginLimiter, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 1 FROM clientes_tokens
            WHERE token = $1 AND tipo = 'redefinir_senha' AND usado_em IS NULL AND expira_em > now()
        `, [req.params.token]);
        if (!rows.length) return res.status(400).json({ valido: false, message: 'Token inválido ou expirado.' });
        res.json({ valido: true });
    } catch (err) {
        console.error('Erro ao validar token de redefinição de senha:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

router.post('/redefinir-senha', loginLimiter, async (req, res) => {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha || novaSenha.length < 6) {
        return res.status(400).json({ message: 'Token e nova senha (mínimo 6 caracteres) são obrigatórios.' });
    }

    try {
        const { rows } = await pool.query(`
            SELECT * FROM clientes_tokens
            WHERE token = $1 AND tipo = 'redefinir_senha' AND usado_em IS NULL AND expira_em > now()
        `, [token]);
        if (!rows.length) return res.status(400).json({ message: 'Token inválido ou expirado.' });

        const senhaHash = await bcrypt.hash(novaSenha, 10);
        await pool.query(`UPDATE clientes SET senha_hash = $1 WHERE id = $2`, [senhaHash, rows[0].cliente_id]);
        await pool.query(`UPDATE clientes_tokens SET usado_em = now() WHERE id = $1`, [rows[0].id]);

        res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// --- painel admin ------------------------------------------------------

router.get('/', authenticate, requireCursosAccess, async (req, res) => {
    const { busca, status, criadoInicio, criadoFim } = req.query;
    const condicoes = [];
    const valores = [];

    // busca por nome/e-mail/cpf não dá mais pra fazer com ILIKE direto no
    // SQL — cpf é cifrado em repouso, e o texto cifrado não preserva
    // substring do original (ver utils/cpfCrypto.js). Só os filtros de
    // status/cadastro continuam no SQL; busca é aplicada em memória depois
    // de decifrar. Sem esses filtros a lista tende só a crescer (clientes
    // nunca são podados), então trazer tudo sempre não escala.
    if (status === 'ativos') condicoes.push('status = true');
    if (status === 'inativos') condicoes.push('status = false');
    if (criadoInicio) {
        valores.push(criadoInicio);
        condicoes.push(`c.criado_em >= $${valores.length}`);
    }
    if (criadoFim) {
        valores.push(criadoFim);
        condicoes.push(`c.criado_em < $${valores.length}`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    try {
        const { rows } = await pool.query(`
            SELECT c.id, c.nome, c.email, c.cpf, c.celular, c.status,
                   c.criado_em AS "criadoEm", c.ultimo_login AS "ultimoLogin",
                   (SELECT count(*) FROM inscricoes i WHERE i.cliente_id = c.id AND i.status = 'pago') AS "totalInscricoes"
            FROM clientes c
            ${where}
            ORDER BY c.criado_em DESC
        `, valores);

        let clientes = rows.map(c => ({ ...c, cpf: decryptCpf(c.cpf) }));

        if (busca && busca.trim()) {
            const termo = busca.trim().toLowerCase();
            clientes = clientes.filter(c =>
                c.nome?.toLowerCase().includes(termo) ||
                c.email?.toLowerCase().includes(termo) ||
                c.cpf?.includes(termo)
            );
        }

        res.json(clientes);
    } catch (err) {
        console.error('Erro ao listar clientes:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// Contadores pro dashboard — agregado em uma query só (em vez da lista de
// clientes inteira, que só cresce e não escala) pra mostrar um resumo sem
// puxar linha por linha.
router.get('/estatisticas', authenticate, requireCursosAccess, async (req, res) => {
    try {
        const [{ rows }, { rows: top }] = await Promise.all([
            pool.query(`
                SELECT
                    count(*) AS total,
                    count(*) FILTER (WHERE status = true) AS ativos,
                    count(*) FILTER (WHERE criado_em >= date_trunc('day', now())) AS hoje,
                    count(*) FILTER (WHERE criado_em >= date_trunc('week', now())) AS semana,
                    count(*) FILTER (WHERE criado_em >= date_trunc('month', now())) AS mes
                FROM clientes
            `),
            // ranking por valor gasto (soma do valor do curso em cada
            // inscrição paga, mesma lógica do gráfico de faturamento) — só
            // entra quem tem pelo menos 1 inscrição paga; LEFT JOIN em cursos
            // pra não sumir da contagem se o curso já foi excluído
            pool.query(`
                SELECT
                    c.id, c.nome, c.email,
                    count(i.id) AS "totalInscricoes",
                    COALESCE(sum(cu.valor), 0) AS "totalGasto"
                FROM clientes c
                JOIN inscricoes i ON i.cliente_id = c.id AND i.status = 'pago'
                LEFT JOIN cursos cu ON cu.id = i.curso_id
                GROUP BY c.id, c.nome, c.email
                ORDER BY "totalGasto" DESC, "totalInscricoes" DESC
                LIMIT 10
            `),
        ]);
        const r = rows[0];
        res.json({
            total: Number(r.total),
            ativos: Number(r.ativos),
            hoje: Number(r.hoje),
            semana: Number(r.semana),
            mes: Number(r.mes),
            top: top.map(t => ({
                id: t.id,
                nome: t.nome,
                email: t.email,
                totalInscricoes: Number(t.totalInscricoes),
                totalGasto: Number(t.totalGasto),
            })),
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas de clientes:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

router.get('/:id', authenticate, requireCursosAccess, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT id, nome, email, cpf, celular, status, criado_em AS "criadoEm", ultimo_login AS "ultimoLogin"
            FROM clientes WHERE id = $1
        `, [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Cliente não encontrado.' });

        const { rows: inscricoes } = await pool.query(`
            SELECT i.id, i.assento, i.status, i.data_inscricao AS "dataInscricao",
                   COALESCE(c.nome_curso, i.curso_removido_nome) AS "nomeCurso",
                   to_char(c.data,'DD/MM/YYYY') AS "dataCurso"
            FROM inscricoes i
            LEFT JOIN cursos c ON c.id = i.curso_id
            WHERE i.cliente_id = $1
            ORDER BY i.data_inscricao DESC
        `, [req.params.id]);

        res.json({ ...rows[0], cpf: decryptCpf(rows[0].cpf), inscricoes });
    } catch (err) {
        console.error('Erro ao buscar cliente:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

router.post('/:id/redefinir-senha', authenticate, requireCursosAccess, async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT id, nome, email FROM clientes WHERE id = $1`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Cliente não encontrado.' });
        const cliente = rows[0];

        const token = uuidv4();
        await pool.query(`
            INSERT INTO clientes_tokens (id, cliente_id, token, tipo, expira_em)
            VALUES ($1, $2, $3, 'redefinir_senha', now() + interval '1 hour')
        `, [uuidv4(), cliente.id, token]);

        logAudit({ entityType: 'cliente', entityId: cliente.id, action: 'redefinir_senha', details: cliente.email, userHubId: req.user?.sub });

        res.json({ message: 'E-mail de redefinição enviado.' });

        const { subject, html } = emailRedefinirSenha({ nome: cliente.nome, token });
        enviarEmail({ to: cliente.email, subject, html });
    } catch (err) {
        console.error('Erro ao redefinir senha (admin):', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

router.put('/:id/status', authenticate, requireCursosAdmin, async (req, res) => {
    const { status } = req.body;
    if (typeof status !== 'boolean') return res.status(400).json({ message: 'status (boolean) obrigatório.' });

    try {
        const { rows } = await pool.query(
            `UPDATE clientes SET status = $1 WHERE id = $2 RETURNING id, nome, email`,
            [status, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Cliente não encontrado.' });

        logAudit({ entityType: 'cliente', entityId: rows[0].id, action: status ? 'ativar' : 'desativar', details: rows[0].email, userHubId: req.user?.sub });

        res.json({ message: 'Atualizado.' });
    } catch (err) {
        console.error('Erro ao atualizar status do cliente:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT email FROM clientes WHERE id = $1`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Cliente não encontrado.' });

        await pool.query(`DELETE FROM clientes WHERE id = $1`, [req.params.id]);

        logAudit({ entityType: 'cliente', entityId: req.params.id, action: 'excluir', details: rows[0].email, userHubId: req.user?.sub });

        res.sendStatus(204);
    } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

module.exports = router;
