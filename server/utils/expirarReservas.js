const MINUTOS_LIMITE = 30;

// Cancela inscrições 'pendente' criadas há mais de 30min — cobre o caso do
// cliente abandonar o pagamento (Pix expirado sem o MP mandar webhook, aba
// fechada no meio do cartão, etc.). Deixar de ser 'pendente' já libera o
// assento sozinho: o índice único parcial em cursos.inscricoes (curso_id,
// assento) só cobre status pendente/pago/reembolsando.
async function expirarReservasPendentes(pool) {
  try {
    const { rowCount } = await pool.query(
      `UPDATE cursos.inscricoes
       SET status = 'cancelado'
       WHERE status = 'pendente' AND data_inscricao < now() - interval '${MINUTOS_LIMITE} minutes'`
    );
    if (rowCount > 0) {
      console.log(`${rowCount} inscrição(ões) expirada(s) após ${MINUTOS_LIMITE}min sem confirmação — assento(s) liberado(s)`);
    }
  } catch (err) {
    console.error('Erro ao expirar inscrições pendentes:', err);
  }
}

module.exports = expirarReservasPendentes;
