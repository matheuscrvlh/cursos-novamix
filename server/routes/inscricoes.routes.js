const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const { authenticateClienteOpcional } = require('../middleware/authCliente.middleware');
const { paymentLimiter } = require('../middleware/rateLimit.middleware');
const pool = require('../db');
const logAudit = require('../utils/logAudit');
const { enviarEmail, emailInscricaoRecebida } = require('../utils/email');
const { encryptCpf, decryptCpf } = require('../utils/cpfCrypto');

const router = express.Router();

// Reservar um assento não precisa mais de trava manual em duas etapas —
// cursos.inscricoes tem um índice único parcial em (curso_id, assento) pra
// status ativos (pendente/pago/reembolsando); o próprio Postgres rejeita
// (23505) se o assento já estiver reivindicado por outra inscrição ativa.
router.post('/', paymentLimiter, authenticateClienteOpcional, async (req, res) => {
  const { cursoId, nome, cpf, celular, email, assento } = req.body;

  if (!cursoId || !nome || !cpf || !celular || !email || assento === undefined) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  const assentoId = Number(assento);
  const id = uuidv4();

  try {
    const { rows: cursoRows } = await pool.query(
      `SELECT capacidade, nome_curso AS "nomeCurso", to_char(data,'DD/MM/YYYY') AS "dataCurso", to_char(data,'HH24:MI') AS "horaCurso" FROM cursos WHERE id = $1`,
      [cursoId]
    );
    if (!cursoRows.length) return res.status(404).json({ message: 'Curso não encontrado' });
    if (!(assentoId >= 1 && assentoId <= cursoRows[0].capacidade)) {
      return res.status(404).json({ message: 'Assento não encontrado' });
    }

    // cliente_id vem do cookie de sessão do cliente, se ele estiver logado
    // (authenticateClienteOpcional não bloqueia requisição sem login — guest
    // checkout continua funcionando, cliente_id só fica NULL nesse caso)
    await pool.query(`
      INSERT INTO inscricoes (id, curso_id, cliente_id, nome, cpf, celular, email, assento, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendente')
    `, [id, cursoId, req.cliente?.sub ?? null, nome, encryptCpf(cpf), celular, email, assentoId]);

    res.status(201).json({
      id, cursoId, nome, cpf, celular, email,
      assento: assentoId, status: 'pendente', dataInscricao: new Date().toISOString(),
    });

    // e-mail é best-effort, dispara depois de já ter respondido — não pode
    // atrasar/derrubar a inscrição em si
    const { subject, html } = emailInscricaoRecebida({ nome, ...cursoRows[0] });
    enviarEmail({ to: email, subject, html });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Assento indisponível' });
    }
    console.error('Erro ao inserir inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// PUT trocar de assento — rota pública (o próprio cliente usa antes de pagar,
// sem estar logado). Só mexe no assento, nunca em status/dados pessoais —
// para isso continua exigindo login via PUT /:id.
router.put('/:id/assento', async (req, res) => {
  const { id } = req.params;
  const { assento } = req.body;

  if (assento === undefined) {
    return res.status(400).json({ message: 'Assento obrigatório' });
  }

  try {
    const { rows } = await pool.query(`SELECT * FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });
    const inscricao = rows[0];
    if (inscricao.status !== 'pendente') {
      return res.status(400).json({ message: 'Não é possível trocar de assento dessa inscrição.' });
    }

    const novoAssentoId = Number(assento);
    if (novoAssentoId === inscricao.assento) {
      return res.json({ message: 'Atualizado' });
    }

    const { rows: cursoRows } = await pool.query(`SELECT capacidade FROM cursos WHERE id = $1`, [inscricao.curso_id]);
    if (!cursoRows.length || !(novoAssentoId >= 1 && novoAssentoId <= cursoRows[0].capacidade)) {
      return res.status(404).json({ message: 'Novo assento não encontrado' });
    }

    try {
      await pool.query(`UPDATE inscricoes SET assento = $1 WHERE id = $2`, [novoAssentoId, id]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ message: 'Esse assento já foi ocupado por outra pessoa.' });
      }
      throw err;
    }

    res.json({ message: 'Atualizado' });
  } catch (err) {
    console.error('Erro ao atualizar assento da inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// Cancela a própria inscrição pendente — rota pública (cliente ainda não
// logado, é a inscrição dele mesmo antes de pagar). Usada quando o cliente
// fecha o modal de pagamento sem concluir, pra liberar o assento na hora em
// vez de deixá-lo preso até o cron de expiração (30min) rodar.
router.post('/:id/cancelar', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT id FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });

    // só cancela se ainda estiver 'pendente' e sem nenhuma tentativa de
    // pagamento registrada — existir uma linha em pagamentos significa que já
    // existe uma tentativa junto ao Mercado Pago cuja confirmação
    // (aprovado/recusado) pode chegar a qualquer momento; cancelar aqui
    // correria o risco de liberar o assento bem na hora em que o pagamento é
    // aprovado, deixando a inscrição "paga" com assento livre
    const { rows: tentativas } = await pool.query(
      `SELECT 1 FROM pagamentos WHERE inscricao_id = $1 LIMIT 1`,
      [id]
    );
    if (tentativas.length > 0) {
      return res.status(400).json({ message: 'Inscrição não pode ser cancelada' });
    }

    // trava atômica: só cancela se ainda estiver 'pendente' — deixar de ser
    // 'pendente'/'pago'/'reembolsando' já libera o assento sozinho (o índice
    // único parcial só cobre esses três status)
    const cancelamento = await pool.query(
      `UPDATE inscricoes SET status = 'cancelado' WHERE id = $1 AND status = 'pendente'`,
      [id]
    );
    if (cancelamento.rowCount === 0) {
      return res.status(400).json({ message: 'Inscrição não pode ser cancelada' });
    }

    res.json({ message: 'Inscrição cancelada' });
  } catch (err) {
    console.error('Erro ao cancelar inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// traz junto o método de pagamento da tentativa mais recente (tabela
// pagamentos) — usado só pra exibição no admin (ex: "Pix"/"Cartão")
const SELECT_COM_METODO_PAGAMENTO = `
  SELECT
    i.id,
    i.curso_id AS "cursoId",
    i.cliente_id AS "clienteId",
    i.nome, i.cpf, i.celular, i.email, i.assento, i.status,
    i.data_inscricao AS "dataInscricao",
    i.curso_removido_nome AS "cursoRemovidoNome",
    i.reembolsado_por AS "reembolsadoPor",
    i.curso_excluido_por AS "cursoExcluidoPor",
    p.metodo_pagamento AS "metodoPagamento"
  FROM inscricoes i
  LEFT JOIN LATERAL (
    SELECT metodo_pagamento FROM pagamentos
    WHERE inscricao_id = i.id
    ORDER BY criado_em DESC
    LIMIT 1
  ) p ON true
`;

router.get('/curso/:cursoId', authenticate, requireCursosAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${SELECT_COM_METODO_PAGAMENTO} WHERE i.curso_id = $1 ORDER BY i.data_inscricao DESC`,
      [req.params.cursoId]
    );
    // cpf vem cifrado do banco (ver utils/cpfCrypto.js) — decifra na borda de saída
    res.json(rows.map(r => ({ ...r, cpf: decryptCpf(r.cpf) })));
  } catch (err) {
    console.error('Erro ao obter inscrições:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// lista geral do admin — cresce pra sempre (uma linha por inscrição feita
// desde o início), então os filtros que o front já usa (tipo, status,
// loja, pagamento, período, busca) viram WHERE aqui em vez de vir tudo e
// filtrar em JS. JOIN com cursos/branchs só serve pra filtrar (tipo/status/
// loja) — o front já resolve os dados de exibição do curso via DadosContext.
router.get('/', authenticate, requireCursosAccess, async (req, res) => {
  try {
    const { tipo, status, loja, pagamento, dataInicio, dataFim, busca } = req.query;
    const condicoes = [];
    const valores = [];

    // curso excluído (i.curso_id não bate com nenhuma linha de cursos, virou
    // NULL via ON DELETE SET NULL): não dá pra saber tipo/loja dele, então
    // essas duas condições sempre deixam passar nesse caso — só "ativos"
    // exclui (curso apagado nunca está "por acontecer")
    if (tipo === 'normais' || tipo === 'infantis') {
      valores.push(tipo === 'normais' ? 'normal' : 'infantil');
      condicoes.push(`(c.id IS NULL OR c.tipo = $${valores.length})`);
    }
    if (status === 'ativos') {
      condicoes.push(`(c.id IS NOT NULL AND c.data > now())`);
    } else if (status === 'concluidos') {
      condicoes.push(`(c.id IS NULL OR c.data <= now())`);
    }
    if (loja && loja !== 'todas') {
      valores.push(loja);
      condicoes.push(`(c.id IS NULL OR REPLACE(b.name, 'Novamix ', '') = $${valores.length})`);
    }
    if (pagamento && pagamento !== 'todos') {
      valores.push(pagamento);
      condicoes.push(`i.status = $${valores.length}`);
    }
    if (dataInicio) {
      valores.push(dataInicio);
      condicoes.push(`i.data_inscricao >= $${valores.length}`);
    }
    if (dataFim) {
      valores.push(dataFim);
      condicoes.push(`i.data_inscricao < $${valores.length}`);
    }
    // busca por nome/cpf não dá mais pra fazer com ILIKE/regexp_replace no
    // SQL — cpf é cifrado em repouso (ver utils/cpfCrypto.js) e o texto
    // cifrado não preserva substring do original. É aplicada em memória
    // depois de decifrar, mais abaixo.

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const { rows } = await pool.query(`
      ${SELECT_COM_METODO_PAGAMENTO}
      LEFT JOIN cursos c ON c.id = i.curso_id
      LEFT JOIN public.branchs b ON b.id = c.filial_id
      ${where}
      ORDER BY i.data_inscricao DESC
    `, valores);

    let inscricoes = rows.map(r => ({ ...r, cpf: decryptCpf(r.cpf) }));

    if (busca && busca.trim()) {
      const termo = busca.trim().toLowerCase();
      const buscaDigits = busca.replace(/\D/g, '');
      inscricoes = inscricoes.filter(i =>
        i.nome?.toLowerCase().includes(termo) ||
        (buscaDigits && (i.cpf || '').replace(/\D/g, '').includes(buscaDigits))
      );
    }

    res.json(inscricoes);
  } catch (err) {
    console.error('Erro ao obter inscrições:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticate, requireCursosAccess, async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, celular, email, assento, status } = req.body;

  try {
    const { rows } = await pool.query(`SELECT id, curso_id FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });

    // sem assentos como tabela própria, nada mais garante que um assento
    // fique dentro da capacidade do curso além dessa checagem — sem ela, um
    // admin podia salvar um assento fora do mapa (nunca aparece como
    // reservado, já que o mapa só gera 1..capacidade)
    if (assento !== undefined) {
      const { rows: cursoRows } = await pool.query(`SELECT capacidade FROM cursos WHERE id = $1`, [rows[0].curso_id]);
      const assentoNum = Number(assento);
      if (!cursoRows.length || !(assentoNum >= 1 && assentoNum <= cursoRows[0].capacidade)) {
        return res.status(400).json({ message: 'Assento fora da capacidade do curso' });
      }
    }

    try {
      await pool.query(`
        UPDATE inscricoes SET
          nome    = COALESCE($1, nome),
          cpf     = COALESCE($2, cpf),
          celular = COALESCE($3, celular),
          email   = COALESCE($4, email),
          assento = COALESCE($5, assento),
          status  = COALESCE($6, status)
        WHERE id = $7
      `, [
        nome ?? null,
        cpf ? encryptCpf(cpf) : null,
        celular ?? null,
        email ?? null,
        assento !== undefined ? Number(assento) : null,
        status ?? null,
        id
      ]);
    } catch (err) {
      // índice único parcial (curso_id, assento) barrado: ou trocou pra um
      // assento já ocupado, ou reativou um status ativo e nesse meio-tempo
      // outra inscrição já pegou esse assento
      if (err.code === '23505') {
        return res.status(400).json({ message: 'Assento indisponível — já ocupado por outra inscrição.' });
      }
      throw err;
    }

    res.json({ message: 'Atualizado' });
  } catch (err) {
    console.error('Erro ao atualizar inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT nome FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });

    await pool.query(`DELETE FROM inscricoes WHERE id = $1`, [id]);

    logAudit({ entityType: 'inscricao', entityId: id, action: 'excluir', details: rows[0].nome, userHubId: req.user?.sub });

    res.json({ message: 'Inscrição e assento removido' });
  } catch (err) {
    console.error('Erro ao deletar inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

module.exports = router;
