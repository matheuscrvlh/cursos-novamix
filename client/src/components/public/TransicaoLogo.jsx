import { Suspense, lazy, useCallback, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TransicaoContext } from '../../contexts/TransicaoContext'

// a parte visual (e o Motion, ~30 KB) vem num pedaço separado do JS, baixado
// logo depois que o site abre, pra não pesar no carregamento inicial
const CamadaTransicao = lazy(() => import('./CamadaTransicao'))

// Troca de página pelo menu com a animação do logo (ver CamadaTransicao).
// Fica em volta das rotas no App: cada página monta o próprio PublicLayout, e
// a animação precisa continuar viva durante a troca
export default function TransicaoLogo({ children }) {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [ativa, setAtiva] = useState(false)
    const [destino, setDestino] = useState(null)
    // cada transição é uma rodada nova da sobreposição (key), com os próprios
    // tempos; o fim de uma rodada antiga não encerra a atual
    const [rodada, setRodada] = useState(0)
    const rodadaAtual = useRef(0)
    // 'parada' → 'cobrindo' (logo entrando) → 'trocou' (página nova por trás)
    const fase = useRef('parada')
    // até o pedaço da animação chegar, os links navegam do jeito normal
    const carregada = useRef(false)

    const navegarComTransicao = useCallback((to) => {
        const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (!carregada.current || reduzirMovimento || to === pathname) return false

        setDestino(to)
        if (fase.current === 'parada') {
            fase.current = 'cobrindo'
            rodadaAtual.current += 1
            setRodada(rodadaAtual.current)
            setAtiva(true)
        } else if (fase.current === 'trocou') {
            // clicou em outro item com a logo ainda na tela: a página já está
            // coberta, troca na hora
            navigate(to)
        }
        // 'cobrindo': a troca ainda vai acontecer e já usa o destino novo
        return true
    }, [pathname, navigate])

    const aoTrocar = useCallback(() => { fase.current = 'trocou' }, [])
    const aoTerminar = useCallback((r) => {
        if (r !== rodadaAtual.current) return
        fase.current = 'parada'
        setAtiva(false)
    }, [])
    const aoCarregar = useCallback(() => { carregada.current = true }, [])

    const valor = useMemo(() => ({ navegarComTransicao }), [navegarComTransicao])

    return (
        <TransicaoContext.Provider value={valor}>
            {children}

            <Suspense fallback={null}>
                <CamadaTransicao
                    ativa={ativa}
                    rodada={rodada}
                    destino={destino}
                    aoTrocar={aoTrocar}
                    aoTerminar={aoTerminar}
                    aoCarregar={aoCarregar}
                />
            </Suspense>
        </TransicaoContext.Provider>
    )
}
