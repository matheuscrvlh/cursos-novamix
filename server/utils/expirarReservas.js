const MINUTOS_LIMITE = 30;

// Cancela inscrições 'pendente' criadas há mais de 30min e libera o assento —
// cobre o caso do cliente abandonar o pagamento (Pix expirado sem o MP
// mandar webhook, aba fechada no meio do cartão, etc.), que senão deixava
// o assento "reservado" pra sempre.
function expirarReservasPendentes(db) {
  const limite = new Date(Date.now() - MINUTOS_LIMITE * 60 * 1000).toISOString();

  db.all(
    `SELECT * FROM inscricoes WHERE status = 'pendente' AND dataInscricao < ?`,
    [limite],
    (err, expiradas) => {
      if (err) return console.error('Erro ao buscar inscrições expiradas:', err);

      expiradas.forEach(inscricao => {
        // trava atômica: só expira se ainda estiver 'pendente' — evita
        // cancelar uma inscrição que o webhook acabou de confirmar como paga
        db.run(
          `UPDATE inscricoes SET status = 'cancelado' WHERE id = ? AND status = 'pendente'`,
          [inscricao.id],
          function (err) {
            if (err) return console.error('Erro ao expirar inscrição:', err);
            if (this.changes === 0) return;

            db.run(
              `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
              [inscricao.cursoId, inscricao.assento],
              err => { if (err) console.error('Erro ao liberar assento expirado:', err); }
            );

            console.log(`Inscrição ${inscricao.id} expirada após ${MINUTOS_LIMITE}min sem confirmação — assento liberado`);
          }
        );
      });
    }
  );
}

module.exports = expirarReservasPendentes;
