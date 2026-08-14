const crypto = require('crypto');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { MercadoPagoConfig, Payment, PaymentRefund } = require('mercadopago');
const pool = require('../db');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

function getMpClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    // sem isso, uma lentidão/instabilidade na API do MP trava a requisição
    // (e a tela do cliente) esperando pra sempre — com timeout, ao menos
    // devolve erro pro cliente tentar de novo em vez de ficar girando
    options: { timeout: 15000 },
  });
}

// Registra/atualiza uma tentativa de pagamento em cursos.pagamentos.
// mp_payment_id é a chave de dedup: webhook, verificação manual e a resposta
// síncrona do Brick podem todos tentar registrar a MESMA tentativa — isso
// deve atualizar a linha existente, nunca duplicar. `executor` pode ser o
// pool ou um client de transação, pra caber tanto em updates isolados quanto
// dentro de uma transação maior (ex: confirmarPagamentoOuReembolsarConflito).
async function upsertPagamento(executor, { inscricaoId, mpPaymentId, metodoPagamento, status }) {
  const agora = new Date().toISOString();
  await executor.query(
    `INSERT INTO pagamentos (id, "inscricaoId", "metodoPagamento", mp_payment_id, status, "criadoEm", "atualizadoEm")
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT (mp_payment_id) DO UPDATE SET
       status = EXCLUDED.status,
       "metodoPagamento" = COALESCE(EXCLUDED."metodoPagamento", pagamentos."metodoPagamento"),
       "atualizadoEm" = EXCLUDED."atualizadoEm"`,
    [uuidv4(), inscricaoId, metodoPagamento || null, mpPaymentId, status, agora]
  );
}

// Traduz o status bruto do MP pro vocabulário que o app já usa em
// inscricoes.status (pago/recusado/cancelado/pendente) — pagamentos.status
// usa o mesmo vocabulário, sem inventar um novo.
function statusPagamentoFromMp(mpStatus) {
  if (mpStatus === 'approved') return 'pago';
  if (mpStatus === 'rejected') return 'recusado';
  if (mpStatus === 'cancelled') return 'cancelado';
  return 'pendente'; // pending, in_process, etc.
}

async function buscarUltimoPaymentId(inscricaoId) {
  const { rows } = await pool.query(
    `SELECT mp_payment_id FROM pagamentos WHERE "inscricaoId" = $1 ORDER BY "criadoEm" DESC LIMIT 1`,
    [inscricaoId]
  );
  return rows[0]?.mp_payment_id ?? null;
}

// Valida CPF de verdade (dígitos verificadores), não só formato —
// o Mercado Pago rejeita CPFs com formato válido mas checksum errado.
function cpfValido(cpf) {
  const digits = (cpf || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calcDV = base => {
    let sum = 0;
    let weight = base.length + 1;
    for (const d of base) sum += Number(d) * weight--;
    const resto = sum % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base9 = digits.slice(0, 9).split('');
  const dv1 = calcDV(base9);
  const dv2 = calcDV([...base9, dv1]);

  return dv1 === Number(digits[9]) && dv2 === Number(digits[10]);
}

// Traduz códigos de erro/status_detail do Mercado Pago para mensagens que fazem sentido pro cliente
const MENSAGENS_MP = {
  2067: 'CPF inválido. Verifique o CPF informado no cadastro e tente novamente.',
  cc_rejected_bad_filled_security_code: 'Código de segurança do cartão inválido.',
  cc_rejected_bad_filled_date: 'Data de validade do cartão inválida.',
  cc_rejected_bad_filled_other: 'Dados do cartão inválidos. Confira e tente novamente.',
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido. Confira e tente novamente.',
  cc_rejected_insufficient_amount: 'Saldo ou limite insuficiente no cartão.',
  cc_rejected_high_risk: 'Pagamento recusado pela operadora do cartão.',
  cc_rejected_call_for_authorize: 'Pagamento não autorizado. Entre em contato com a operadora do seu cartão.',
  cc_rejected_card_disabled: 'Cartão desabilitado. Entre em contato com o banco emissor.',
  cc_rejected_duplicated_payment: 'Já existe um pagamento recente com esses dados.',
  cc_rejected_max_attempts: 'Número máximo de tentativas excedido. Tente outro cartão.',
};

function mensagemAmigavelMp(mpErrOuCodigo) {
  const code = typeof mpErrOuCodigo === 'string'
    ? mpErrOuCodigo
    : mpErrOuCodigo?.cause?.[0]?.code ?? mpErrOuCodigo?.message;
  return MENSAGENS_MP[code] || 'Não foi possível processar o pagamento. Verifique os dados e tente novamente.';
}

// Erros específicos do endpoint de estorno — separados de MENSAGENS_MP porque
// o texto padrão fala de "pagamento recusado", que não faz sentido pra quem
// está tentando reembolsar
const MENSAGENS_REEMBOLSO_MP = {
  // code 120049: o MP ainda não "assentou" a transação pro estorno — comum
  // tentar reembolsar segundos/minutos depois do pagamento ser aprovado
  120049: 'Este pagamento foi aprovado há pouco tempo e o Mercado Pago ainda não liberou o estorno para ele. Aguarde alguns minutos e tente novamente.',
  // instabilidade genérica da API do MP (cause vem vazio, sem código específico)
  internal_server_error: 'O Mercado Pago apresentou uma instabilidade ao processar o estorno. Tente novamente em alguns instantes.',
};

function mensagemAmigavelReembolso(err) {
  const code = err?.cause?.[0]?.code ?? err?.error;
  return MENSAGENS_REEMBOLSO_MP[code]
    || err?.cause?.[0]?.description
    || err?.message
    || 'Erro ao reembolsar no Mercado Pago';
}

// Confirma o pagamento como 'pago' e reocupa o assento — a menos que, nesse
// meio-tempo (reserva expirada + webhook/verificação atrasada), o assento já
// tenha sido vendido pra outra inscrição. Nesse caso, em vez de duplicar a
// vaga, estorna automaticamente esse pagamento no Mercado Pago e marca a
// inscrição como 'reembolsado' — quem pagou não fica no prejuízo, só sem vaga.
async function confirmarPagamentoOuReembolsarConflito({ inscricaoId, cursoId, assento, paymentId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // checagem de conflito e confirmação precisam ser um único UPDATE atômico:
    // antes, o SELECT de conflito rodava separado do UPDATE, então duas chamadas
    // concorrentes (webhook + verificação manual + resposta síncrona do Brick,
    // todas podem disparar essa função pro mesmo assento) podiam passar pelo
    // SELECT ao mesmo tempo, ambas concluírem "sem conflito" e ambas confirmarem
    // 'pago' pro mesmo assento — daí pra frente qualquer liberação/expiração de
    // uma delas mexia na mesma linha de `assentos` e desfazia o status da outra.
    // A transação garante que a confirmação do pagamento e a reocupação do
    // assento acontecem juntas (ou nenhuma das duas, se o processo cair no meio).
    const confirmacao = await client.query(
      `UPDATE inscricoes SET status = 'pago'
       WHERE id = $1 AND status != 'pago'
         AND NOT EXISTS (
           SELECT 1 FROM inscricoes i2
           WHERE i2."cursoId" = $2 AND i2.assento = $3 AND i2.id != $4
             AND i2.status IN ('pendente', 'pago', 'reembolsando')
         )`,
      [inscricaoId, cursoId, assento, inscricaoId]
    );

    if (confirmacao.rowCount === 0) {
      await client.query('ROLLBACK');

      // não confirmou: já estava 'pago' (chamada concorrente ganhou primeiro,
      // nada a fazer) ou existe conflito real de assento (precisa reembolsar)
      const { rows } = await pool.query(`SELECT status FROM inscricoes WHERE id = $1`, [inscricaoId]);
      if (rows[0]?.status === 'pago') return { ok: true };

      try {
        const paymentRefund = new PaymentRefund(getMpClient());
        await paymentRefund.total({ payment_id: paymentId });
        await pool.query(`UPDATE inscricoes SET status = 'reembolsado' WHERE id = $1`, [inscricaoId]);
        await upsertPagamento(pool, { inscricaoId, mpPaymentId: paymentId, status: 'reembolsado' });
        console.warn(`[conflito de assento] Inscrição ${inscricaoId} paga porém assento ${assento} do curso ${cursoId} já ocupado por outra inscrição — reembolsada automaticamente`);
      } catch (refundErr) {
        console.error(`[conflito de assento] Falha ao reembolsar automaticamente a inscrição ${inscricaoId} — requer ação manual:`, refundErr);
      }
      return { ok: false, conflito: true };
    }

    await upsertPagamento(client, { inscricaoId, mpPaymentId: paymentId, status: 'pago' });
    await client.query(
      `UPDATE assentos SET status = 'reservado' WHERE "cursoId" = $1 AND id = $2`,
      [cursoId, assento]
    );
    await client.query('COMMIT');
    return { ok: true };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao confirmar pagamento:', err);
    return { ok: false };
  } finally {
    client.release();
  }
}

function validateMpSignature(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[MP] MP_WEBHOOK_SECRET não configurado — webhook bloqueado em produção');
      return false;
    }
    console.warn('[MP] MP_WEBHOOK_SECRET ausente — validação desativada (somente desenvolvimento)');
    return true;
  }

  const sig = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'] || '';
  if (!sig) return false;

  const parts = {};
  sig.split(',').forEach(part => {
    const [k, v] = part.split('=');
    parts[k.trim()] = v ? v.trim() : '';
  });

  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const dataId = req.query?.['data.id'] || req.body?.data?.id || '';
  const template = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const computed = crypto.createHmac('sha256', secret).update(template).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(v1, 'hex'));
  } catch {
    return false;
  }
}

// Usado pelo modal de pagamento pra dar polling enquanto o QR do Pix tá
// visível — só precisa saber quando o status vira 'pago'.
router.get('/status/:inscricaoId', async (req, res) => {
  const { inscricaoId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT id, status FROM inscricoes WHERE id = $1`,
      [inscricaoId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro interno' });
  }
});

router.post('/verificar/:inscricaoId', authenticate, requireCursosAccess, async (req, res) => {
  const { inscricaoId } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM inscricoes WHERE id = $1`, [inscricaoId]);
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });
    const inscricao = rows[0];

    const mpPaymentId = await buscarUltimoPaymentId(inscricaoId);
    if (!mpPaymentId) {
      return res.status(400).json({ message: 'Sem ID de pagamento para verificar no MercadoPago' });
    }

    const payment = new Payment(getMpClient());
    const paymentData = await payment.get({ id: mpPaymentId });
    const mpStatus = paymentData.status;

    let novoStatus = inscricao.status;

    if (mpStatus === 'approved') {
      if (inscricao.status === 'pago') {
        novoStatus = 'pago';
      } else {
        const resultado = await confirmarPagamentoOuReembolsarConflito({
          inscricaoId,
          cursoId: inscricao.cursoId,
          assento: inscricao.assento,
          paymentId: mpPaymentId,
        });
        novoStatus = resultado.conflito ? 'reembolsado' : 'pago';
      }
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      const statusRevertido = mpStatus === 'rejected' ? 'recusado' : 'cancelado';
      // só reverte/libera se ainda estiver 'pendente' — sem essa trava, um
      // payment_id antigo/reconsultado podia sobrescrever uma inscrição que
      // já tinha sido confirmada como 'pago' por outra via (webhook, etc.)
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(
          `UPDATE inscricoes SET status = $1 WHERE id = $2 AND status = 'pendente'`,
          [statusRevertido, inscricaoId]
        );
        if (result.rowCount > 0) {
          novoStatus = statusRevertido;
          await client.query(
            `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
            [inscricao.cursoId, inscricao.assento]
          );
          await upsertPagamento(client, { inscricaoId, mpPaymentId, status: statusRevertido });
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    res.json({ status: novoStatus, mpStatus });
  } catch (err) {
    console.error('Erro ao verificar pagamento no MP:', err);
    res.status(500).json({ message: 'Erro ao consultar MercadoPago' });
  }
});

// Devolve o valor total ao cliente e libera a vaga. Só a confirmação vem do
// frontend; depois de chamado o MP não tem como desfazer, então validamos
// tudo antes de mexer no dinheiro.
router.post('/reembolsar/:inscricaoId', authenticate, requireCursosAdmin, async (req, res) => {
  const { inscricaoId } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM inscricoes WHERE id = $1`, [inscricaoId]);
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });
    const inscricao = rows[0];
    if (inscricao.status !== 'pago') {
      return res.status(400).json({ message: 'Só é possível reembolsar inscrições pagas' });
    }

    const mpPaymentId = await buscarUltimoPaymentId(inscricaoId);
    if (!mpPaymentId) {
      return res.status(400).json({ message: 'Sem ID de pagamento para reembolsar no MercadoPago' });
    }

    // trava atômica: o WHERE status = 'pago' garante que, sob dois cliques
    // (ou dois admins) quase simultâneos, só uma requisição sai de 'pago' e
    // chega a chamar o MP — evita reembolsar o mesmo pagamento duas vezes
    const trava = await pool.query(
      `UPDATE inscricoes SET status = 'reembolsando' WHERE id = $1 AND status = 'pago'`,
      [inscricaoId]
    );
    if (trava.rowCount === 0) {
      return res.status(409).json({ message: 'Reembolso já em andamento para esta inscrição' });
    }

    try {
      const paymentRefund = new PaymentRefund(getMpClient());
      await paymentRefund.total({ payment_id: mpPaymentId });

      // só libera a vaga e marca como reembolsada depois do MP confirmar o reembolso
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`UPDATE inscricoes SET status = 'reembolsado' WHERE id = $1`, [inscricaoId]);
        await client.query(
          `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
          [inscricao.cursoId, inscricao.assento]
        );
        await upsertPagamento(client, { inscricaoId, mpPaymentId, status: 'reembolsado' });
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      res.json({ status: 'reembolsado', reembolsado: true });
    } catch (err) {
      console.error('Erro ao reembolsar pagamento no MP:', err);
      // MP não confirmou o reembolso — volta pro estado anterior
      await pool.query(`UPDATE inscricoes SET status = 'pago' WHERE id = $1`, [inscricaoId]);
      res.status(500).json({ message: mensagemAmigavelReembolso(err) });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro interno' });
  }
});

router.post('/webhook', async (req, res) => {
  if (!validateMpSignature(req)) {
    console.warn('Webhook MP com assinatura inválida rejeitado');
    return res.status(401).json({ message: 'Assinatura inválida' });
  }

  res.sendStatus(200);

  const { type, data } = req.body || {};
  if (type !== 'payment' || !data?.id) return;

  try {
    const payment = new Payment(getMpClient());
    const paymentData = await payment.get({ id: data.id });

    const inscricaoId = paymentData.external_reference;
    const status = paymentData.status;
    const paymentId = String(data.id);

    if (!inscricaoId) return;

    if (status === 'approved') {
      const { rows } = await pool.query(
        `SELECT "cursoId", assento, status AS "statusAtual" FROM inscricoes WHERE id = $1`,
        [inscricaoId]
      );
      const inscricao = rows[0];
      if (!inscricao || inscricao.statusAtual === 'pago') return;
      await confirmarPagamentoOuReembolsarConflito({
        inscricaoId,
        cursoId: inscricao.cursoId,
        assento: inscricao.assento,
        paymentId,
      });
    } else if (status === 'rejected' || status === 'cancelled') {
      // 'rejected' = recusado pela operadora/banco, 'cancelled' = cancelado
      // (ex: Pix expirado) — status diferentes pro admin não confundir
      const novoStatus = status === 'rejected' ? 'recusado' : 'cancelado';
      const { rows } = await pool.query(
        `SELECT * FROM inscricoes WHERE id = $1 AND status = 'pendente'`,
        [inscricaoId]
      );
      const inscricao = rows[0];
      if (!inscricao) return;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
          [inscricao.cursoId, inscricao.assento]
        );
        await client.query(
          `UPDATE inscricoes SET status = $1 WHERE id = $2`,
          [novoStatus, inscricaoId]
        );
        await upsertPagamento(client, { inscricaoId, mpPaymentId: paymentId, status: novoStatus });
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao marcar', novoStatus, ':', err);
      } finally {
        client.release();
      }
    } else if (status === 'pending' || status === 'in_process') {
      const { rows } = await pool.query(
        `SELECT id FROM inscricoes WHERE id = $1 AND status = 'pendente'`,
        [inscricaoId]
      );
      if (rows.length) {
        await upsertPagamento(pool, { inscricaoId, mpPaymentId: paymentId, status: 'pendente' });
      }
    }
  } catch (err) {
    console.error('Erro no webhook MP:', err);
  }
});

router.post('/processar-pagamento', paymentLimiter, async (req, res) => {
  const { inscricaoId, token, issuer_id, payment_method_id, payer } = req.body;
  const isPix = payment_method_id === 'pix';
  const metodoPagamento = isPix ? 'pix' : 'cartao';

  if (!inscricaoId || (!isPix && !token)) {
    return res.status(400).json({ message: 'Dados de pagamento incompletos' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT i.*, c."nomeCurso", c.valor AS "cursoValor"
       FROM inscricoes i
       LEFT JOIN cursos c ON c.id = i."cursoId"
       WHERE i.id = $1`,
      [inscricaoId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Inscrição não encontrada' });
    const inscricao = rows[0];

    if (inscricao.status === 'pago') {
      return res.status(400).json({ message: 'Inscrição já paga' });
    }

    // CPF vem da inscrição (já coletado no cadastro), não do Brick — o Brick de Pix
    // só pede e-mail, sem campo de CPF.
    const cpfDigits = (inscricao.cpf || '').replace(/\D/g, '');
    if (!cpfValido(cpfDigits)) {
      return res.status(400).json({ message: 'O CPF cadastrado na inscrição é inválido. Corrija o CPF e tente novamente.' });
    }

    // sem essa checagem, um curso com preço ausente/corrompido no banco
    // caía no fallback e cobrava R$1,00 do cliente silenciosamente
    const valor = parseFloat(inscricao.cursoValor);
    if (!(valor > 0)) {
      console.error(`Valor inválido pro curso ${inscricao.cursoId} (cursoValor="${inscricao.cursoValor}") — pagamento da inscrição ${inscricaoId} bloqueado`);
      return res.status(500).json({ message: 'Não foi possível determinar o valor do curso. Contate o suporte.' });
    }

    const body = {
      transaction_amount: valor,
      description: inscricao.nomeCurso || `Curso ${inscricaoId}`,
      payment_method_id,
      payer: {
        email: payer?.email || inscricao.email,
        identification: {
          type: 'CPF',
          number: cpfDigits,
        },
      },
      external_reference: String(inscricaoId),
      notification_url: `${process.env.BACKEND_URL}/api/pagamentos/webhook`,
    };

    if (!isPix) {
      body.token = token;
      body.installments = 1;
      body.issuer_id = issuer_id;
    }

    try {
      const payment = new Payment(getMpClient());
      const paymentData = await payment.create({ body });

      const status = paymentData.status;
      const paymentId = String(paymentData.id);
      let conflitoAssento = false;

      // registra a tentativa independente do resultado — usado como
      // referência caso precise verificar/reembolsar depois
      await upsertPagamento(pool, {
        inscricaoId,
        mpPaymentId: paymentId,
        metodoPagamento,
        status: statusPagamentoFromMp(status),
      });

      if (status === 'approved') {
        const resultado = await confirmarPagamentoOuReembolsarConflito({
          inscricaoId,
          cursoId: inscricao.cursoId,
          assento: inscricao.assento,
          paymentId,
        });
        conflitoAssento = !!resultado.conflito;
      } else if (status === 'rejected' || status === 'cancelled') {
        // 'rejected' = recusado pela operadora/banco (cartão), 'cancelled' =
        // pagamento cancelado (ex: Pix expirado) — status diferentes pro
        // admin não confundir recusa de cartão com cancelamento
        const novoStatus = status === 'rejected' ? 'recusado' : 'cancelado';
        // só reverte/libera se ainda estiver 'pendente' — entre o carregamento
        // da inscrição e a resposta do payment.create (chamada de rede que pode
        // demorar), outra tentativa concorrente para a mesma inscrição pode já
        // ter sido aprovada; sem essa trava isso sobrescreveria um pagamento
        // já confirmado de volta pra 'recusado'/'cancelado' e liberaria o assento
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await client.query(
            `UPDATE inscricoes SET status = $1 WHERE id = $2 AND status = 'pendente'`,
            [novoStatus, inscricaoId]
          );
          if (result.rowCount > 0) {
            await client.query(
              `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
              [inscricao.cursoId, inscricao.assento]
            );
          }
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.error('Erro ao marcar', novoStatus, ':', err);
        } finally {
          client.release();
        }
      }

      const transactionData = paymentData.point_of_interaction?.transaction_data;

      res.json({
        status: conflitoAssento ? 'cancelled' : status,
        status_detail: conflitoAssento ? 'seat_conflict_refunded' : paymentData.status_detail,
        message: conflitoAssento
          ? 'Pagamento aprovado, porém a vaga já havia sido ocupada por outra pessoa nesse meio-tempo. O valor foi estornado automaticamente no Mercado Pago.'
          : (status === 'rejected' ? mensagemAmigavelMp(paymentData.status_detail) : undefined),
        id: paymentId,
        qr_code: transactionData?.qr_code,
        qr_code_base64: transactionData?.qr_code_base64,
      });
    } catch (mpErr) {
      console.error('Erro ao processar pagamento:', mpErr);
      res.status(400).json({ message: mensagemAmigavelMp(mpErr) });
    }
  } catch (err) {
    console.error('Erro ao processar pagamento:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
