const MINUTOS_LIMITE = 30;

// Cancela inscrições 'pendente' criadas há mais de 30min e libera o assento —
// cobre o caso do cliente abandonar o pagamento (Pix expirado sem o MP
// mandar webhook, aba fechada no meio do cartão, etc.), que senão deixava
// o assento "reservado" pra sempre.
async function expirarReservasPendentes(pool) {
  const limite = new Date(Date.now() - MINUTOS_LIMITE * 60 * 1000).toISOString();

  let expiradas;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM inscricoes WHERE status = 'pendente' AND "dataInscricao" < $1`,
      [limite]
    );
    expiradas = rows;
  } catch (err) {
    console.error('Erro ao buscar inscrições expiradas:', err);
    return;
  }

  for (const inscricao of expiradas) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // trava atômica: só expira se ainda estiver 'pendente' — evita
      // cancelar uma inscrição que o webhook acabou de confirmar como paga
      const result = await client.query(
        `UPDATE inscricoes SET status = 'cancelado' WHERE id = $1 AND status = 'pendente'`,
        [inscricao.id]
      );

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        continue;
      }

      await client.query(
        `UPDATE assentos SET status = 'livre' WHERE "cursoId" = $1 AND id = $2`,
        [inscricao.cursoId, inscricao.assento]
      );

      await client.query('COMMIT');
      console.log(`Inscrição ${inscricao.id} expirada após ${MINUTOS_LIMITE}min sem confirmação — assento liberado`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erro ao expirar inscrição:', err);
    } finally {
      client.release();
    }
  }
}

module.exports = expirarReservasPendentes;
