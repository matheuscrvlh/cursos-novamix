// as chaves são o valor que vem do banco em `curso.loja` / `culinarista.lojas`
// (sem acento) — o `nome` é só pra exibir
export const LOJAS = {
    Prado: {
        nome: 'Prado',
        cidade: 'Nova Friburgo',
        endereco: 'Av. Gov. Roberto Silveira, 1700 - Duas Pedras, Nova Friburgo - RJ',
        horario: 'De Seg a Sab, das 8:30 às 19h',
        mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.8119903550783!2d-42.52638522395205!3d-22.24721111463339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97f53afe6cd153%3A0x1a71499c558657e1!2sNovaMix%20Food%20Service!5e0!3m2!1spt-BR!2sbr!4v1775067360332!5m2!1spt-BR!2sbr',
    },
    Teresopolis: {
        nome: 'Teresópolis',
        cidade: 'Teresópolis',
        endereco: 'R. Duque de Caxias, 170 - Várzea, Teresópolis - RJ',
        horario: 'De Seg a Sab, das 8:30 às 19h',
        mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3688.439377782724!2d-42.97246841431132!3d-22.412482567792775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x984dd8feadadd3%3A0x999ed84beae4d97b!2sNovamix%20Food%20Service!5e0!3m2!1spt-BR!2sbr!4v1775069806369!5m2!1spt-BR!2sbr',
    },
}

export function nomeLoja(loja) {
    return LOJAS[loja]?.nome || loja
}

export function linkComoChegar(loja) {
    const endereco = LOJAS[loja]?.endereco
    if (!endereco) return null
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Novamix Food Service ${endereco}`)}`
}
