// Padrão dos nomes de curso: primeira letra da frase em maiúscula e o resto em
// minúscula, independente de como foi digitado — menos os nomes próprios,
// que ficam com maiúscula: "BOLO DE NATAL DA NESTLÉ" e "bolo de natal da
// nestle" viram "Bolo de Natal da Nestlé". Espaços repetidos viram um só.
// A mesma regra existe no front (client/src/utils/formatTitulo.js) — se
// mudar aqui, mudar lá também.

// Nomes próprios fixos. Além destes, entram os nomes das indústrias
// parceiras (tabela industrias), que são as marcas que aparecem nos títulos.
const NOMES_PROPRIOS = [
  'Natal', 'Páscoa', 'Ano Novo', 'Réveillon', 'Carnaval', 'São João', 'Halloween',
  'Dia das Mães', 'Dia dos Pais', 'Dia dos Namorados', 'Dia das Crianças', 'Novamix',
];

// marca cadastrada toda em maiúscula ("CACAU FOODS") entra como "Cacau Foods";
// as escritas com maiúscula e minúscula ("Master Martini") ficam como estão
function grafiaDoNome(nome) {
  const limpo = nome.trim().replace(/\s+/g, ' ');
  if (limpo !== limpo.toLocaleUpperCase('pt-BR')) return limpo;
  return limpo.toLocaleLowerCase('pt-BR').replace(/(^|\s)(\p{L})/gu, (_, espaco, letra) => espaco + letra.toLocaleUpperCase('pt-BR'));
}

// acha o nome como palavra inteira, sem ligar para maiúscula/minúscula nem
// para acento ("nestle" acha "Nestlé"; "natalino" não conta como "Natal")
function padraoDoNome(nome) {
  const corpo = [...nome].map(c => {
    if (c === ' ') return '\\s+';
    const semAcento = c.normalize('NFD').replace(/\p{M}/gu, '');
    if (semAcento !== c) return `[${semAcento}${c}]`;
    return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('');
  return new RegExp(`(?<![\\p{L}\\p{N}])${corpo}(?![\\p{L}\\p{N}])`, 'giu');
}

function formatarTitulo(texto, nomesExtras = []) {
  if (typeof texto !== 'string') return texto;
  const limpo = texto.trim().replace(/\s+/g, ' ');
  if (!limpo) return limpo;

  let resultado = limpo.toLocaleLowerCase('pt-BR');
  // nomes mais longos primeiro: "Dia das Crianças" antes de um "Dia" sozinho
  const nomes = [...NOMES_PROPRIOS, ...nomesExtras.filter(n => typeof n === 'string' && n.trim())]
    .map(grafiaDoNome)
    .sort((a, b) => b.length - a.length);
  for (const nome of nomes) {
    resultado = resultado.replace(padraoDoNome(nome), nome);
  }
  return resultado.charAt(0).toLocaleUpperCase('pt-BR') + resultado.slice(1);
}

module.exports = { formatarTitulo };
