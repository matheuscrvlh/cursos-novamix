const nodemailer = require('nodemailer');

// sem SMTP_HOST, enviarEmail vira no-op (só loga) em vez de derrubar a
// requisição que chamou
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
} else {
  console.warn('[email] SMTP_HOST não configurado — envio de e-mail desativado (rodando em modo no-op)');
}

const REMETENTE = process.env.SMTP_FROM || 'Novamix Cursos <nao-responda@lojanovamix.com.br>';

async function enviarEmail({ to, subject, html }) {
  if (!transporter) {
    console.warn(`[email] (no-op) enviaria "${subject}" para ${to}`);
    return false;
  }
  try {
    await transporter.sendMail({ from: REMETENTE, to, subject, html });
    return true;
  } catch (err) {
    console.error(`[email] Falha ao enviar "${subject}" para ${to}:`, err.message);
    return false;
  }
}

// --- templates -------------------------------------------------------

const BASE_URL = process.env.FRONTEND_URL?.split(',')[0] || '';

function layout(titulo, corpoHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
      <div style="background: #ff7a00; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Novamix Cursos</h1>
      </div>
      <div style="padding: 24px; background: #fff;">
        <h2 style="font-size: 18px; margin-top: 0;">${titulo}</h2>
        ${corpoHtml}
      </div>
      <div style="padding: 16px 24px; color: #999; font-size: 12px; text-align: center;">
        Este é um e-mail automático, não é necessário responder.
      </div>
    </div>
  `;
}

function emailInscricaoRecebida({ nome, nomeCurso, dataCurso, horaCurso }) {
  return {
    subject: `Inscrição recebida — ${nomeCurso}`,
    html: layout('Inscrição recebida!', `
      <p>Olá, ${nome}!</p>
      <p>Recebemos sua inscrição no curso <strong>${nomeCurso}</strong>, no dia <strong>${dataCurso}</strong> às <strong>${horaCurso}</strong>.</p>
      <p>Assim que o pagamento for confirmado, sua vaga estará garantida.</p>
    `),
  };
}

function emailPagamentoConfirmado({ nome, nomeCurso, dataCurso, horaCurso }) {
  return {
    subject: `Pagamento confirmado — ${nomeCurso}`,
    html: layout('Pagamento confirmado!', `
      <p>Olá, ${nome}!</p>
      <p>Seu pagamento do curso <strong>${nomeCurso}</strong> foi confirmado — sua vaga está garantida para <strong>${dataCurso}</strong> às <strong>${horaCurso}</strong>.</p>
      <p>Até lá!</p>
    `),
  };
}

function emailReembolsoProcessado({ nome, nomeCurso }) {
  return {
    subject: `Reembolso processado — ${nomeCurso}`,
    html: layout('Reembolso processado', `
      <p>Olá, ${nome}!</p>
      <p>O reembolso da sua inscrição no curso <strong>${nomeCurso}</strong> foi processado. O valor deve aparecer no seu extrato em alguns dias, de acordo com o prazo da sua operadora/banco.</p>
    `),
  };
}

function emailLembreteCurso({ nome, nomeCurso, dataCurso, horaCurso, loja }) {
  return {
    subject: `Seu curso é amanhã — ${nomeCurso}`,
    html: layout('Seu curso é amanhã!', `
      <p>Olá, ${nome}!</p>
      <p>Passando pra lembrar que o curso <strong>${nomeCurso}</strong> é amanhã, dia <strong>${dataCurso}</strong> às <strong>${horaCurso}</strong>, na loja <strong>${loja}</strong>.</p>
      <p>Te esperamos lá!</p>
    `),
  };
}

function emailRedefinirSenha({ nome, token }) {
  const link = `${BASE_URL}/redefinir-senha?token=${token}`;
  return {
    subject: 'Redefinir sua senha',
    html: layout('Redefinir senha', `
      <p>Olá${nome ? `, ${nome}` : ''}!</p>
      <p>Recebemos um pedido para redefinir sua senha. Clique no link abaixo (válido por 1 hora):</p>
      <p><a href="${link}" style="display:inline-block; background:#ff7a00; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none;">Redefinir senha</a></p>
      <p>Se você não pediu isso, pode ignorar este e-mail.</p>
    `),
  };
}

module.exports = {
  enviarEmail,
  emailInscricaoRecebida,
  emailPagamentoConfirmado,
  emailReembolsoProcessado,
  emailLembreteCurso,
  emailRedefinirSenha,
};
