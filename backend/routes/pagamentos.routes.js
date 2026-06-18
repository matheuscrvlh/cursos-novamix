const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const db = require('../db');

const router = express.Router();

function getMpClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
  });
}

// POST criar preferência de pagamento
router.post('/criar-preferencia', async (req, res) => {
  const { inscricaoId } = req.body;
  if (!inscricaoId) return res.status(400).json({ message: 'inscricaoId obrigatório' });

  db.get(`SELECT * FROM inscricoes WHERE id = ?`, [inscricaoId], async (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });

    db.get(`SELECT * FROM cursos WHERE id = ?`, [inscricao.cursoId], async (err, curso) => {
      if (err) return res.status(500).json({ message: 'Erro interno' });

      const valor = Math.max(parseFloat(curso?.valor) || 1, 0.01);
      const nomeCurso = curso?.nomeCurso || 'Curso';

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
                number: inscricao.cpf.replace(/\D/g, ''),
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

// POST webhook do Mercado Pago
router.post('/webhook', async (req, res) => {
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
      db.run(
        `UPDATE inscricoes SET status = 'pago', mp_payment_id = ? WHERE id = ?`,
        [paymentId, inscricaoId],
        err => { if (err) console.error('Erro ao marcar pago:', err); }
      );
    } else if (status === 'rejected' || status === 'cancelled') {
      db.get(`SELECT * FROM inscricoes WHERE id = ?`, [inscricaoId], (err, inscricao) => {
        if (err || !inscricao) return;
        db.run(
          `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
          [inscricao.cursoId, inscricao.assento]
        );
        db.run(
          `UPDATE inscricoes SET status = 'cancelado', mp_payment_id = ? WHERE id = ?`,
          [paymentId, inscricaoId]
        );
      });
    }
  } catch (err) {
    console.error('Erro no webhook MP:', err);
  }
});

module.exports = router;
