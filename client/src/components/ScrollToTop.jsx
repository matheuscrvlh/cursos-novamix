import { useEffect, useEffectEvent, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

import { rolarPara } from '../utils/rolagemSuave'
import { paginaMontou } from '../utils/historico'

// Rolagem na troca de página: página nova vai pro topo, e quem volta (botão
// do navegador, gesto de voltar do celular ou o "Voltar para a agenda" do
// curso) cai no mesmo ponto em que estava, e não no banner lá de cima.
// Link com #id (ex: /cursos#agenda) vai direto pra aquela parte da página.
//
// A posição de cada entrada do histórico (location.key) fica anotada aqui. O
// navegador não consegue restaurar sozinho: ele tenta antes de a página voltar
// a existir (o React Router monta ela depois)
const posicoes = new Map()
let chaveAtual = null
let cancelarEspera = null

// as listas de curso aparecem um instante depois da página (efeitos que
// filtram os cursos): enquanto a página não tem altura pra chegar no destino,
// espera ela crescer — por mudança no DOM, que continua chegando com a tela
// segurada pela transição. Até ESPERA_MS; depois vai até onde der
const ESPERA_MS = 500

function rolarQuandoCouber(destino, pronto) {
    cancelarEspera?.()
    const cabe = () => document.documentElement.scrollHeight - window.innerHeight >= destino - 1
    if (cabe()) {
        rolarPara(destino, { imediato: true })
        return pronto()
    }

    const observador = new MutationObserver(() => { if (cabe()) terminar() })
    const limite = setTimeout(() => terminar(), ESPERA_MS)
    function terminar() {
        cancelarEspera()
        rolarPara(destino, { imediato: true })
        pronto()
    }
    cancelarEspera = () => {
        observador.disconnect()
        clearTimeout(limite)
        cancelarEspera = null
    }
    observador.observe(document.body, { childList: true, subtree: true })
}

export default function ScrollToTop() {
    const { pathname, hash, key } = useLocation()
    const tipo = useNavigationType()

    useEffect(() => {
        history.scrollRestoration = 'manual'
        const anotar = () => { if (chaveAtual) posicoes.set(chaveAtual, window.scrollY) }
        window.addEventListener('scroll', anotar, { passive: true })
        return () => window.removeEventListener('scroll', anotar)
    }, [])

    // layout effect: troca a chave antes de o navegador avisar a rolagem da
    // página nova (que pode encurtar e "rolar" sozinha) — senão ela sobrescrevia
    // a posição guardada da anterior
    useLayoutEffect(() => {
        chaveAtual = key
    }, [key])

    const rolar = useEffectEvent(() => {
        const alvo = hash && document.getElementById(hash.slice(1))
        const header = document.querySelector('[data-cabecalho]')?.offsetHeight ?? 0
        const destino = tipo === 'POP' ? posicoes.get(key) ?? 0
            : alvo ? alvo.getBoundingClientRect().top + window.scrollY - header
            : 0
        // com a página no lugar, a transição entre as páginas pode seguir (utils/historico)
        rolarQuandoCouber(Math.max(0, Math.round(destino)), paginaMontou)
    })

    // antes da primeira pintura da página nova, pra ela não aparecer no lugar
    // errado e pular. Só quando muda de página: clicar num #id da mesma página
    // fica com a rolagem suave da âncora
    useLayoutEffect(() => {
        rolar()
    }, [pathname])

    return null
}
