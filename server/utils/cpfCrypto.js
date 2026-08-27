const crypto = require('crypto');

// AES-256-GCM com IV determinístico (derivado do próprio CPF via HMAC) em vez
// de um IV aleatório por chamada (o normal pra GCM) — assim o mesmo CPF
// sempre vira o mesmo texto cifrado. Isso é necessário pra manter, sem coluna
// extra, duas coisas que a aplicação já depende de CPF em texto puro: o
// UNIQUE de clientes.cpf e a checagem de duplicata no cadastro (`cpf = $1`)
// continuam funcionando comparando o valor cifrado direto no Postgres. O
// preço é semântico (dois registros com o mesmo CPF ficam com o mesmo texto
// cifrado), mas isso é exatamente o que o UNIQUE já precisa expor pra
// funcionar — não é um vazamento novo.
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits — tamanho recomendado pro GCM
const AUTH_TAG_LENGTH = 16;

function getMasterKey() {
  const secret = process.env.CPF_ENCRYPTION_KEY;
  if (!secret) throw new Error('CPF_ENCRYPTION_KEY não configurado');
  return Buffer.from(secret, 'utf8');
}

// duas subchaves derivadas da mesma secret (HMAC como KDF) — separa o papel
// "cifrar" do papel "gerar IV" em vez de reaproveitar a chave crua nos dois,
// e dispensa exigir do .env uma chave com tamanho exato (HMAC absorve
// qualquer tamanho de entrada)
function derivarSubchave(master, label) {
  return crypto.createHmac('sha256', master).update(label).digest();
}

function derivarIv(ivKey, plaintext) {
  return crypto.createHmac('sha256', ivKey).update(plaintext).digest().subarray(0, IV_LENGTH);
}

// cpf: string (pode ter pontuação ou não, guarda exatamente o que recebeu) ou
// null/undefined/'' — devolve null nesses casos, preservando o contrato de
// coluna nullable que cpf sempre teve.
function encryptCpf(cpf) {
  if (!cpf) return null;

  const master = getMasterKey();
  const encKey = derivarSubchave(master, 'cpf-enc');
  const ivKey = derivarSubchave(master, 'cpf-iv');
  const iv = derivarIv(ivKey, cpf);

  const cipher = crypto.createCipheriv(ALGO, encKey, iv);
  const encrypted = Buffer.concat([cipher.update(cpf, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

// best-effort — se a chave mudou ou o valor está corrompido, loga e devolve
// null em vez de derrubar a rota que só queria exibir/usar o CPF
function decryptCpf(valorCifrado) {
  if (!valorCifrado) return null;

  try {
    const master = getMasterKey();
    const encKey = derivarSubchave(master, 'cpf-enc');
    const buf = Buffer.from(valorCifrado, 'base64');

    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGO, encKey, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch (err) {
    console.error('Erro ao decifrar CPF:', err.message);
    return null;
  }
}

module.exports = { encryptCpf, decryptCpf };
