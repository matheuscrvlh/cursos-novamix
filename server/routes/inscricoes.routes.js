const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimit.middleware');
const pool = require('../db');

const router = express.Router();

router.post('/', paymentLimiter, async (req, res) => {
  const { cursoId, nome, cpf, celular, email, assento } = req.body;

  if (!cursoId || !nome || !cpf || !celular || !email || assento === undefined) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  const assentoId = Number(assento);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: cadeiras } = await client.query(
      `SELECT * FROM assentos WHERE "cursoId" = $1 AND id = $2`,
      [cursoId, assentoId]
    );
    if (!cadeiras.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Assento não encontrado' });
    }

    // reservar assento de forma atômica: o WHERE status = 'livre' garante que,
    // sob concorrência, só uma requisição consegue mudar o status (rowCount === 1).
    // Checar e depois dar UPDATE em passos separados permitia duas pessoas reservarem
    // o mesmo assento ao mesmo tempo. A transação garante que, se o INSERT da
    // inscrição falhar depois, a reserva do assento é desfeita junto (ROLLBACK).
    const reserva = await client.query(
      `UPDATE assentos SET status = 'reservado' WHERE "cursoId" = $1 AND id = $2 AND status = 'livre'`,
      [cursoId, assentoId]
    );
    if (reserva.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Assento indisponível' });
    }

    const id = uuidv4();
    const dataInscricao = new Date().toISOString();

    await client.query(`
      INSERT INTO inscricoes
        (id, "cursoId", nome, cpf, celular, email, assento, status, "dataInscricao")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, cursoId, nome, cpf, celular, email, assentoId, 'pendente', dataInscricao]);

    await client.query('COMMIT');

    res.status(201).json({ id, cursoId, nome, cpf, celular, email, assento: assentoId, status: 'pendente', dataInscricao });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao inserir inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    client.release();
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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`SELECT * FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    const inscricao = rows[0];
    if (inscricao.status !== 'pendente') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Não é possível trocar de assento dessa inscrição.' });
    }

    const novoAssentoId = Number(assento);
    if (novoAssentoId === inscricao.assento) {
      await client.query('ROLLBACK');
      return res.json({ message: 'Atualizado' });
    }

    const { rows: novoAssentoRows } = await client.query(
      `SELECT * FROM assentos WHERE "cursoId" = $1 AND id = $2`,
      [inscricao.cursoId, novoAssentoId]
    );
    if (!novoAssentoRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Novo assento não encontrado' });
    }

    // reserva atômica do novo assento — evita que duas pessoas troquem para o
    // mesmo assento ao mesmo tempo (ver comentário equivalente no POST '/')
    const reserva = await client.query(
      `UPDATE assentos SET status = 'reservado' WHERE "cursoId" = $1 AND id = $2 AND status = 'livre'`,
      [inscricao.cursoId, novoAssentoId]
    );
    if (reserva.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Esse assento já foi ocupado por outra pessoa.' });
    }

    await client.query(
      `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
      [inscricao.cursoId, inscricao.assento]
    );

    await client.query(
      `UPDATE inscricoes SET assento = $1 WHERE id = $2`,
      [novoAssentoId, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Atualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar assento da inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

// Cancela a própria inscrição pendente — rota pública (cliente ainda não
// logado, é a inscrição dele mesmo antes de pagar). Usada quando o cliente
// fecha o modal de pagamento sem concluir, pra liberar o assento na hora em
// vez de deixá-lo preso até o cron de expiração (30min) rodar.
router.post('/:id/cancelar', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`SELECT * FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    const inscricao = rows[0];

    // só cancela se ainda estiver 'pendente' e sem nenhuma tentativa de
    // pagamento registrada — existir uma linha em pagamentos significa que já
    // existe uma tentativa junto ao Mercado Pago cuja confirmação
    // (aprovado/recusado) pode chegar a qualquer momento; cancelar aqui
    // correria o risco de liberar o assento bem na hora em que o pagamento é
    // aprovado, deixando a inscrição "paga" com assento livre
    const { rows: tentativas } = await client.query(
      `SELECT 1 FROM pagamentos WHERE "inscricaoId" = $1 LIMIT 1`,
      [id]
    );
    if (tentativas.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Inscrição não pode ser cancelada' });
    }

    // trava atômica: só cancela se ainda estiver 'pendente'
    const cancelamento = await client.query(
      `UPDATE inscricoes SET status = 'cancelado' WHERE id = $1 AND status = 'pendente'`,
      [id]
    );
    if (cancelamento.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Inscrição não pode ser cancelada' });
    }

    await client.query(
      `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
      [inscricao.cursoId, inscricao.assento]
    );

    await client.query('COMMIT');
    res.json({ message: 'Inscrição cancelada' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao cancelar inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

// traz junto o método de pagamento da tentativa mais recente (tabela
// pagamentos) — usado só pra exibição no admin (ex: "Pix"/"Cartão")
const SELECT_COM_METODO_PAGAMENTO = `
  SELECT i.*, p."metodoPagamento"
  FROM inscricoes i
  LEFT JOIN LATERAL (
    SELECT "metodoPagamento" FROM pagamentos
    WHERE "inscricaoId" = i.id
    ORDER BY "criadoEm" DESC
    LIMIT 1
  ) p ON true
`;

router.get('/curso/:cursoId', authenticate, requireCursosAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${SELECT_COM_METODO_PAGAMENTO} WHERE i."cursoId" = $1 ORDER BY i."dataInscricao" ASC`,
      [req.params.cursoId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao obter inscrições:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/', authenticate, requireCursosAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_COM_METODO_PAGAMENTO} ORDER BY i."dataInscricao" ASC`);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao obter inscrições:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticate, requireCursosAccess, async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, celular, email, assento, status } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`SELECT * FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    const inscricao = rows[0];

    // qualquer status terminal (não só 'cancelado') precisa liberar o assento —
    // senão editar manualmente pra 'recusado'/'reembolsado' por aqui deixava
    // o assento preso como 'reservado' pra sempre, mesmo sem inscrição ativa
    const ESTADOS_TERMINAIS = ['cancelado', 'recusado', 'reembolsado'];
    const trocarAssento = assento !== undefined && Number(assento) !== inscricao.assento;
    const cancelando = status !== undefined && ESTADOS_TERMINAIS.includes(status) && !ESTADOS_TERMINAIS.includes(inscricao.status);
    const reativando = status !== undefined && !ESTADOS_TERMINAIS.includes(status) && ESTADOS_TERMINAIS.includes(inscricao.status);

    if (trocarAssento) {
      const novoAssentoId = Number(assento);

      // reserva atômica do novo assento (ver comentário equivalente no POST '/')
      const reserva = await client.query(
        `UPDATE assentos SET status = 'reservado' WHERE "cursoId" = $1 AND id = $2 AND status = 'livre'`,
        [inscricao.cursoId, novoAssentoId]
      );
      if (reserva.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Novo assento indisponível' });
      }

      await client.query(
        `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
        [inscricao.cursoId, inscricao.assento]
      );
    } else if (reativando) {
      // volta de 'cancelado' pra outro status: a vaga foi liberada quando cancelou,
      // então precisa conferir se ninguém mais pegou antes de reservar de novo —
      // reserva atômica (ver comentário equivalente no POST '/')
      const reserva = await client.query(
        `UPDATE assentos SET status = 'reservado' WHERE "cursoId" = $1 AND id = $2 AND status = 'livre'`,
        [inscricao.cursoId, inscricao.assento]
      );
      if (reserva.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Não é possível reativar: essa vaga já foi ocupada por outra pessoa.' });
      }
    }

    await client.query(`
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
      cpf ?? null,
      celular ?? null,
      email ?? null,
      trocarAssento ? Number(assento) : null,
      status ?? null,
      id
    ]);

    if (cancelando) {
      const assentoParaLiberar = trocarAssento ? Number(assento) : inscricao.assento;
      await client.query(
        `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
        [inscricao.cursoId, assentoParaLiberar]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Atualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`SELECT * FROM inscricoes WHERE id = $1`, [id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    const inscricao = rows[0];

    // só libera se não existir OUTRA inscrição ativa pro mesmo assento — sem
    // essa checagem, excluir uma das duas inscrições de um assento duplicado
    // (pra "resolver" o conflito manualmente) liberava o assento por baixo da
    // inscrição paga que sobrou, fazendo o cliente que pagou sumir do mapa
    await client.query(
      `UPDATE assentos SET status = 'livre'
       WHERE "cursoId" = $1 AND id = $2
         AND NOT EXISTS (
           SELECT 1 FROM inscricoes i2
           WHERE i2."cursoId" = $3 AND i2.assento = $4 AND i2.id != $5
             AND i2.status IN ('pendente', 'pago', 'reembolsando')
         )`,
      [inscricao.cursoId, inscricao.assento, inscricao.cursoId, inscricao.assento, id]
    );

    await client.query(`DELETE FROM inscricoes WHERE id = $1`, [id]);

    await client.query('COMMIT');
    res.json({ message: 'Inscrição e assento removido' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar inscrição:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

module.exports = router;
