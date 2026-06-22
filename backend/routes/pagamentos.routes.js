const crypto = require('crypto');
const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

function getMpClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
  });
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

// POST criar preferência de pagamento
router.post('/criar-preferencia', async (req, res) => {
  const { inscricaoId } = req.body;
  if (!inscricaoId) return res.status(400).json({ message: 'inscricaoId obrigatório' });

  db.get(`SELECT * FROM inscricoes WHERE id = ?`, [inscricaoId], async (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });

    // Idempotência: se já existe preference, reutiliza
    if (inscricao.mp_preference_id) {
      try {
        const preference = new Preference(getMpClient());
        const existing = await preference.get({ preferenceId: inscricao.mp_preference_id });
        const checkout_url = process.env.NODE_ENV === 'production'
          ? existing.init_point
          : existing.sandbox_init_point;
        return res.json({ checkout_url });
      } catch {
        // Preference expirada ou inválida — cria uma nova abaixo
      }
    }

    db.get(`SELECT * FROM cursos WHERE id = ?`, [inscricao.cursoId], async (err, curso) => {
      if (err) return res.status(500).json({ message: 'Erro interno' });

      const valor = Math.max(parseFloat(curso?.valor) || 1, 0.01);
      const nomeCurso = curso?.nomeCurso || 'Curso';
      const cpfDigits = (inscricao.cpf || '').replace(/\D/g, '');

      if (cpfDigits.length !== 11 || /^(\d)\1{10}$/.test(cpfDigits)) {
        return res.status(400).json({ message: 'CPF inválido' });
      }

      try {
        const preference = new Preference(getMpClient());
        const pref = await preference.create({
          body: {
            items: [{
              title: nomeCurso,
              quantity: 1,
              unit_price: valor,
              currency_id: 'BRL',
            }],
            payer: {
              name: inscricao.nome,
              identification: {
                type: 'CPF',
                number: cpfDigits,
              },
            },
            back_urls: {
              success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
              failure: `${process.env.FRONTEND_URL}/pagamento/falha`,
              pending: `${process.env.FRONTEND_URL}/pagamento/pendente`,
            },
            auto_return: 'approved',
            external_reference: inscricaoId,
            notification_url: `${process.env.BACKEND_URL}/api/pagamentos/webhook`,
          },
        });

        db.run(
          `UPDATE inscricoes SET mp_preference_id = ? WHERE id = ?`,
          [pref.id, inscricaoId],
          err => { if (err) console.error('Erro ao salvar preference_id:', err); }
        );

        const checkout_url = process.env.NODE_ENV === 'production'
          ? pref.init_point
          : pref.sandbox_init_point;

        res.json({ checkout_url });
      } catch (mpErr) {
        console.error('Erro ao criar preferência MP:', mpErr);
        res.status(500).json({ message: 'Erro ao criar preferência de pagamento' });
      }
    });
  });
});

// GET status da inscrição (para verificar após retorno do MP)
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

// POST verificar pagamento manualmente no MP (admin)
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
      }

      res.json({ status: novoStatus, mpStatus });
    } catch (err) {
      console.error('Erro ao verificar pagamento no MP:', err);
      res.status(500).json({ message: 'Erro ao consultar MercadoPago' });
    }
  });
});

// POST webhook do Mercado Pago
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

module.exports = router;
