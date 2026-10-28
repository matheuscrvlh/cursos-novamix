// Foto do curso na troca de página (a transição em si é do utils/historico):
// abrindo pelo card, a foto cresce até virar a arte da página do curso
// ([data-foto-curso], com o mesmo nome); voltando, a arte encolhe de volta
// pro card de onde saiu. Os tempos estão no index.css (foto-curso)
const NOME = 'foto-curso'

// a foto cresce um pouco no hover do card. A imagem da transição pega a foto
// sem o recorte do card, então ela vai sem esse zoom (senão vazaria pelas bordas)
function marcar(foto) {
    foto.style.transition = 'none'
    foto.style.transform = 'none'
    foto.style.viewTransitionName = NOME
}

// clique no card, logo antes de navegar (o card sai da tela junto com a página)
export function marcarFotoDoCard(foto) {
    if (foto) marcar(foto)
}

// com a página nova já montada: se saiu da página de um curso e o card dele
// está na tela, marca o quadro da foto e devolve como desfazer (no fim da
// transição). O quadro inteiro, com a data e a loja por cima: elas vão
// surgindo enquanto a arte encolhe, em vez de aparecerem de repente no fim
export function marcarFotoDeVolta(deCaminho) {
    if (!deCaminho.startsWith('/curso/')) return null

    const quadro = [...document.querySelectorAll('a[href^="/curso/"]')].find(a => {
        const caixa = a.getBoundingClientRect()
        return a.getAttribute('href') === deCaminho && a.querySelector('img')
            && caixa.bottom > 0 && caixa.top < window.innerHeight && caixa.right > 0 && caixa.left < window.innerWidth
    })
    if (!quadro) return null

    quadro.style.viewTransitionName = NOME
    return () => { quadro.style.viewTransitionName = '' }
}
