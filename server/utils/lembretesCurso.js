const { enviarEmail, emailLembreteCurso } = require('./email');

// Manda lembrete pra quem já pagou, ~24h antes do curso. Janela de 23-25h
// (não "amanhã" cravado) porque o job roda de hora em hora — sem a janela,
// cursos na borda seriam pulados ou pegos duas vezes.
async function enviarLembretesCurso(pool) {
  let inscricoes;
  try {
    const { rows } = await pool.query(`
      SELECT i.id, i.nome, i.email,
             c.nome_curso AS "nomeCurso",
             to_char(c.data,'DD/MM/YYYY') AS "dataCurso",
             to_char(c.data,'HH24:MI') AS "horaCurso",
             REPLACE(b.name, 'Novamix ', '') AS loja
      FROM cursos.inscricoes i
      JOIN cursos.cursos c ON c.id = i.curso_id
      LEFT JOIN public.branchs b ON b.id = c.filial_id
      WHERE i.status = 'pago'
        AND i.lembrete_enviado_em IS NULL
        AND c.data BETWEEN now() + interval '23 hours' AND now() + interval '25 hours'
    `);
    inscricoes = rows;
  } catch (err) {
    console.error('Erro ao buscar inscrições pra lembrete de curso:', err);
    return;
  }

  for (const inscricao of inscricoes) {
    try {
      // marca ANTES de enviar — evita reenviar se o processo cair no meio do
      // loop (melhor perder um lembrete raro do que mandar duplicado)
      const marcado = await pool.query(
        `UPDATE cursos.inscricoes SET lembrete_enviado_em = now() WHERE id = $1 AND lembrete_enviado_em IS NULL`,
        [inscricao.id]
      );
      if (marcado.rowCount === 0) continue;

      const { subject, html } = emailLembreteCurso(inscricao);
      await enviarEmail({ to: inscricao.email, subject, html });
    } catch (err) {
      // sem isso, um erro no meio do loop (ex: soneca de conexão do pool)
      // vira uma promise rejeitada sem handler — como essa função roda via
      // setInterval sem .catch, isso derrubava o processo inteiro (Node
      // mata o processo em unhandledRejection)
      console.error(`Erro ao enviar lembrete pra inscrição ${inscricao.id}:`, err);
    }
  }

  if (inscricoes.length > 0) {
    console.log(`${inscricoes.length} lembrete(s) de curso enviado(s)`);
  }
}

module.exports = enviarLembretesCurso;
