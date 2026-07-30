const crypto = require('crypto');
const express = require('express');
const { MercadoPagoConfig, Payment, PaymentRefund } = require('mercadopago');
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

function getMpClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
  });
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

router.get('/status/:inscricaoId', (req, res) => {
  const { inscricaoId } = req.params;
  db.get(
    `SELECT id, status, formaPagamento, mp_preference_id, mp_payment_id FROM inscricoes WHERE id = ?`,
    [inscricaoId],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Erro interno' });
      if (!row) return res.status(404).json({ message: 'Inscrição não encontrada' });
      res.json(row);
    }
  );
});

router.post('/verificar/:inscricaoId', authMiddleware, async (req, res) => {
  const { inscricaoId } = req.params;

  db.get(`SELECT * FROM inscricoes WHERE id = ?`, [inscricaoId], async (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });

    if (!inscricao.mp_payment_id) {
      return res.status(400).json({ message: 'Sem ID de pagamento para verificar no MercadoPago' });
    }

    try {
      const payment = new Payment(getMpClient());
      const paymentData = await payment.get({ id: inscricao.mp_payment_id });
      const mpStatus = paymentData.status;

      let novoStatus = inscricao.status;

      if (mpStatus === 'approved') {
        novoStatus = 'pago';
        db.run(`UPDATE inscricoes SET status = 'pago' WHERE id = ?`, [inscricaoId]);
      } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
        novoStatus = 'cancelado';
        db.run(`UPDATE inscricoes SET status = 'cancelado' WHERE id = ?`, [inscricaoId]);
        if (inscricao.status !== 'cancelado') {
          db.run(
            `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
            [inscricao.cursoId, inscricao.assento],
            err => { if (err) console.error('Erro ao liberar assento:', err); }
          );
        }
      }

      res.json({ status: novoStatus, mpStatus });
    } catch (err) {
      console.error('Erro ao verificar pagamento no MP:', err);
      res.status(500).json({ message: 'Erro ao consultar MercadoPago' });
    }
  });
});

// Devolve o valor total ao cliente e libera a vaga. Só a confirmação vem do
// frontend; depois de chamado o MP não tem como desfazer, então validamos
// tudo antes de mexer no dinheiro.
router.post('/reembolsar/:inscricaoId', authMiddleware, async (req, res) => {
  const { inscricaoId } = req.params;

  db.get(`SELECT * FROM inscricoes WHERE id = ?`, [inscricaoId], (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });
    if (inscricao.status !== 'pago') {
      return res.status(400).json({ message: 'Só é possível reembolsar inscrições pagas' });
    }
    if (!inscricao.mp_payment_id) {
      return res.status(400).json({ message: 'Sem ID de pagamento para reembolsar no MercadoPago' });
    }

    // trava atômica: o WHERE status = 'pago' garante que, sob dois cliques
    // (ou dois admins) quase simultâneos, só uma requisição sai de 'pago' e
    // chega a chamar o MP — evita reembolsar o mesmo pagamento duas vezes
    db.run(
      `UPDATE inscricoes SET status = 'reembolsando' WHERE id = ? AND status = 'pago'`,
      [inscricaoId],
      async function (err) {
        if (err) return res.status(500).json({ message: 'Erro interno' });
        if (this.changes === 0) {
          return res.status(409).json({ message: 'Reembolso já em andamento para esta inscrição' });
        }

        try {
          const paymentRefund = new PaymentRefund(getMpClient());
          await paymentRefund.total({ payment_id: inscricao.mp_payment_id });

          // só libera a vaga e marca como reembolsada depois do MP confirmar o reembolso
          db.run(`UPDATE inscricoes SET status = 'reembolsado' WHERE id = ?`, [inscricaoId]);
          db.run(
            `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
            [inscricao.cursoId, inscricao.assento],
            err => { if (err) console.error('Erro ao liberar assento após reembolso:', err); }
          );

          res.json({ status: 'reembolsado', reembolsado: true });
        } catch (err) {
          console.error('Erro ao reembolsar pagamento no MP:', err);
          // MP não confirmou o reembolso — volta pro estado anterior
          db.run(`UPDATE inscricoes SET status = 'pago' WHERE id = ?`, [inscricaoId]);
          const mensagem = err?.cause?.[0]?.description || err?.message || 'Erro ao reembolsar no Mercado Pago';
          res.status(500).json({ message: mensagem });
        }
      }
    );
  });
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
      // Guarda idempotente: só atualiza se ainda não está pago
      db.run(
        `UPDATE inscricoes SET status = 'pago', mp_payment_id = ? WHERE id = ? AND status != 'pago'`,
        [paymentId, inscricaoId],
        err => { if (err) console.error('Erro ao marcar pago:', err); }
      );
    } else if (status === 'rejected' || status === 'cancelled') {
      db.get(`SELECT * FROM inscricoes WHERE id = ? AND status = 'pendente'`, [inscricaoId], (err, inscricao) => {
        if (err || !inscricao) return;
        db.run(
          `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
          [inscricao.cursoId, inscricao.assento],
          err => { if (err) console.error('Erro ao liberar assento:', err); }
        );
        db.run(
          `UPDATE inscricoes SET status = 'cancelado', mp_payment_id = ? WHERE id = ?`,
          [paymentId, inscricaoId],
          err => { if (err) console.error('Erro ao marcar cancelado:', err); }
        );
      });
    } else if (status === 'pending' || status === 'in_process') {
      db.run(
        `UPDATE inscricoes SET mp_payment_id = ? WHERE id = ? AND status = 'pendente'`,
        [paymentId, inscricaoId],
        err => { if (err) console.error('Erro ao salvar payment_id:', err); }
      );
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

  db.get(
    `SELECT i.*,
       COALESCE(c.nomeCurso, ci.nomeCurso) AS nomeCurso,
       COALESCE(c.valor, ci.valor) AS cursoValor
     FROM inscricoes i
     LEFT JOIN cursos c ON c.id = i.cursoId
     LEFT JOIN cursosInfantis ci ON ci.id = i.cursoId
     WHERE i.id = ?`,
    [inscricaoId],
    async (err, inscricao) => {
      if (err) return res.status(500).json({ message: 'Erro interno' });
      if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });
      if (inscricao.status === 'pago') {
        return res.status(400).json({ message: 'Inscrição já paga' });
      }

      // CPF vem da inscrição (já coletado no cadastro), não do Brick — o Brick de Pix
      // só pede e-mail, sem campo de CPF.
      const cpfDigits = (inscricao.cpf || '').replace(/\D/g, '');
      if (!cpfValido(cpfDigits)) {
        return res.status(400).json({ message: 'O CPF cadastrado na inscrição é inválido. Corrija o CPF e tente novamente.' });
      }

      const valor = Math.max(parseFloat(inscricao.cursoValor) || 1, 0.01);

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

        if (status === 'approved') {
          db.run(
            `UPDATE inscricoes SET status = 'pago', mp_payment_id = ?, metodoPagamento = ? WHERE id = ? AND status != 'pago'`,
            [paymentId, metodoPagamento, inscricaoId],
            err => { if (err) console.error('Erro ao marcar pago:', err); }
          );
        } else if (status === 'rejected' || status === 'cancelled') {
          db.run(
            `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
            [inscricao.cursoId, inscricao.assento],
            err => { if (err) console.error('Erro ao liberar assento:', err); }
          );
          db.run(
            `UPDATE inscricoes SET status = 'cancelado', mp_payment_id = ?, metodoPagamento = ? WHERE id = ?`,
            [paymentId, metodoPagamento, inscricaoId],
            err => { if (err) console.error('Erro ao marcar cancelado:', err); }
          );
        } else {
          db.run(
            `UPDATE inscricoes SET mp_payment_id = ?, metodoPagamento = ? WHERE id = ?`,
            [paymentId, metodoPagamento, inscricaoId],
            err => { if (err) console.error('Erro ao salvar payment_id:', err); }
          );
        }

        const transactionData = paymentData.point_of_interaction?.transaction_data;

        res.json({
          status,
          status_detail: paymentData.status_detail,
          message: status === 'rejected' ? mensagemAmigavelMp(paymentData.status_detail) : undefined,
          id: paymentId,
          qr_code: transactionData?.qr_code,
          qr_code_base64: transactionData?.qr_code_base64,
        });
      } catch (mpErr) {
        console.error('Erro ao processar pagamento:', mpErr);
        res.status(400).json({ message: mensagemAmigavelMp(mpErr) });
      }
    }
  );
});

module.exports = router;
