const multer = require('multer');

// Erros que chegam aqui vêm do multer (arquivo grande demais, campo
// inesperado) ou de algo que estourou antes do try da rota. Nos dois casos a
// mensagem crua (em inglês, ou do Postgres) não vai pro usuário — só pro log.
const MENSAGENS_MULTER = {
  LIMIT_FILE_SIZE: 'Imagem muito grande (máximo 5 MB).',
  LIMIT_FILE_COUNT: 'Arquivos demais nesse envio.',
  LIMIT_UNEXPECTED_FILE: 'Campo de arquivo inesperado.',
};

function tratarErroUpload(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: MENSAGENS_MULTER[err.code] || 'Arquivo inválido.' });
  }
  // dado mal formado vindo do formulário (ex: JSON.parse da lista de lojas)
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  console.error(`Erro em ${req.method} ${req.baseUrl}${req.path}:`, err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = tratarErroUpload;
