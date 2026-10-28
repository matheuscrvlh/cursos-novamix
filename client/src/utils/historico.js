import { UNSAFE_createBrowserHistory as createBrowserHistory } from 'react-router-dom'

import { marcarFotoDeVolta } from './transicaoCurso'

// Histórico do site (main.jsx, no lugar do BrowserRouter). Toda troca de
// página passa por aqui, inclusive o "voltar" do navegador e do celular, e
// ganha uma transição leve: a página de antes some, a nova surge e o header
// fica parado (View Transitions API do navegador; os tempos estão no
// index.css). Abrindo um curso pelo card, a foto cresce até a arte da página do
// curso; voltando, ela encolhe de volta pro card (utils/transicaoCurso).
//
// Como funciona: o React Router só fica sabendo da página nova dentro da
// transição, depois de o navegador guardar a imagem da página de antes. E a
// imagem da nova espera ela montar e rolar pro lugar certo (paginaMontou, no
// ScrollToTop). Sem a API, com "reduzir movimento" ou quando outra animação já
// cobre a troca (a do logo, no menu), a troca é direta.
//
// createBrowserHistory e HistoryRouter são da parte "instável" do React Router
// (UNSAFE_ / unstable_): conferir ao atualizar a biblioteca
const ESPERA_MAX_MS = 600

export const historico = createBrowserHistory({ v5Compat: true })

let caminhoAtual = historico.location.pathname
let ultimaTroca = null
let esperandoCaptura = false
let aoMontar = null
let pularProxima = false
let voltando = false

// a página que está montando agora veio do voltar/avançar do histórico (e não
// de um link): o que ela tem de "surgir na tela" já aparece pronto (useEntrouNaTela)
export function voltandoNoHistorico() {
    return voltando
}

// a próxima troca já vem coberta por outra animação (o logo do menu)
export function semTransicaoNaProxima() {
    pularProxima = true
}

// a página nova montou e já está rolada no lugar
export function paginaMontou() {
    aoMontar?.()
}

const ouvir = historico.listen
historico.listen = avisarRouter => ouvir(troca => {
    const de = caminhoAtual
    caminhoAtual = troca.location.pathname
    ultimaTroca = troca
    voltando = troca.action === 'POP'

    // outra troca no meio de uma que ainda nem começou a animar: vai direto
    // (a que estava esperando também já leva o React Router pra esta)
    const animar = document.startViewTransition && de !== caminhoAtual && !pularProxima && !esperandoCaptura
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pularProxima = false
    if (!animar) return avisarRouter(troca)

    esperandoCaptura = true
    let desmarcar = null
    const atualizar = () => new Promise(pronta => {
        esperandoCaptura = false
        const limite = setTimeout(() => terminar(), ESPERA_MAX_MS)
        function terminar() {
            clearTimeout(limite)
            aoMontar = null
            desmarcar = marcarFotoDeVolta(de)
            pronta()
        }
        aoMontar = terminar
        avisarRouter(ultimaTroca)
    })
    // voltando, a transição leva o tipo "volta" (o card do curso aparece só
    // perto do fim, ver index.css). Navegador sem tipos: a mesma transição, sem ele
    const comTipos = voltando && typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype
    const transicao = comTipos
        ? document.startViewTransition({ update: atualizar, types: ['volta'] })
        : document.startViewTransition(atualizar)
    // nome repetido ou captura que não deu certo: a troca acontece sem animar
    transicao.ready.catch(() => {})
    transicao.finished.finally(() => desmarcar?.())
})
