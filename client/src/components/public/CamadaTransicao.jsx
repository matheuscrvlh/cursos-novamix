import { useEffect, useEffectEvent, useId, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'

import { semTransicaoNaProxima } from '../../utils/historico'
import { Brilho } from './Doces'
import { LETRA_N, LETRA_M, COR_N, COR_M, TRACO_N, TRACO_M, PINCEL } from './logoNovamix'

// Parte visual da troca de página pelo menu (TransicaoLogo): o fundo desfoca,
// o "n" e o "m" da Novamix se desenham num selo branco, dão um pulinho e
// somem. É o único lugar que usa o Motion, e vem num pedaço separado do JS
// (React.lazy), baixado logo depois que o site abre.
//
// Linha do tempo (s), contada de quando a sobreposição aparece:
//  0      fundo desfoca, selo entra passando um pouco do tamanho
//  0.02   "n" se desenha · 0.08 "m" se desenha
//  0.26   letras prontas: pulinho, onda e faíscas
//  0.28   troca a página (TROCA_MS), com a tela coberta
//  0.48   tudo some em ~0.25s (SAIDA_MS) — no total, ~0.75s
//
// A troca fica pra depois do desenho das letras: o desenho (pathLength) roda
// em JavaScript e engasgaria enquanto o React monta a página nova. Já o
// pulinho, a onda e as faíscas animam o `transform` inteiro (não scale/x/y
// soltos), que o Motion entrega pro navegador (WAAPI) — esses seguem lisos.
// A saída espera a página nova estar montada (celular lento), até LIMITE_MS
const TROCA_MS = 280
const SAIDA_MS = 480
const LIMITE_MS = 1600
const PULINHO = 0.26

// versões enxutas (`m`) dos elementos animados, com os recursos do
// LazyMotion lá embaixo. Nome maiúsculo porque o lint do projeto
// (no-unused-vars) só reconhece uso no JSX de nomes que começam com maiúscula
const MotionDiv = m.div
const MotionSpan = m.span
const MotionPath = m.path

// curva do "pincel" que desenha as letras (logoNovamix)
const DESENHO = [0.45, 0, 0.25, 1]

// faíscas que saem do selo: ângulo (graus, 0 = direita, sentido horário) e
// distância final do centro (px)
const FAISCAS = [
    { ang: -90, dist: 106, tam: 'w-5' },
    { ang: -28, dist: 98, tam: 'w-4' },
    { ang: 32, dist: 110, tam: 'w-5' },
    { ang: 90, dist: 100, tam: 'w-4' },
    { ang: 148, dist: 108, tam: 'w-5' },
    { ang: 210, dist: 96, tam: 'w-4' },
]

// curva que passa um pouco do ponto e volta (o "pop" do selo)
const PASSA_DO_PONTO = [0.34, 1.56, 0.64, 1]

function Faisca({ ang, dist, tam, indice }) {
    const rad = (ang * Math.PI) / 180
    const em = (r, escala, giro) =>
        `translate(${(Math.cos(rad) * r).toFixed(1)}px, ${(Math.sin(rad) * r).toFixed(1)}px) scale(${escala}) rotate(${giro}deg)`

    return (
        <MotionSpan
            className={`absolute left-1/2 top-1/2 ${tam} aspect-square -translate-x-1/2 -translate-y-1/2`}
            initial={{ opacity: 0, transform: em(52, 0, 0) }}
            animate={{
                opacity: [0, 1, 0],
                transform: [em(52, 0, 0), em(dist * 0.85, 1, 45), em(dist, 0, 90)],
            }}
            transition={{ delay: PULINHO + indice * 0.015, duration: 0.5, times: [0, 0.45, 1], ease: 'easeOut' }}
        >
            <Brilho className='w-full h-full' />
        </MotionSpan>
    )
}

function LogoDesenhando() {
    // ids das máscaras: únicos por montagem (ver Doces.jsx)
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')

    return (
        <MotionDiv
            className='relative w-32 h-32 md:w-36 md:h-36'
            initial={{ opacity: 0, transform: 'scale(0.55) rotate(-16deg)' }}
            animate={{ opacity: 1, transform: 'scale(1) rotate(0deg)' }}
            exit={{ opacity: 0, transform: 'scale(1.18) rotate(0deg)', transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ transform: { duration: 0.42, ease: PASSA_DO_PONTO }, opacity: { duration: 0.12 } }}
        >
            {FAISCAS.map((f, i) => <Faisca key={i} {...f} indice={i} />)}

            {/* onda que sai do selo quando as letras terminam */}
            <MotionSpan
                className='absolute inset-0 rounded-full border-2 border-orange-base/45'
                initial={{ opacity: 0, transform: 'scale(1)' }}
                animate={{ opacity: [0.9, 0], transform: ['scale(1)', 'scale(1.75)'] }}
                transition={{ delay: PULINHO, duration: 0.55, ease: 'easeOut' }}
            />

            {/* pulinho do selo no fim do desenho */}
            <MotionDiv
                className='absolute inset-0'
                animate={{ transform: ['scale(1)', 'scale(1.08)', 'scale(0.97)', 'scale(1)'] }}
                transition={{ delay: PULINHO - 0.02, duration: 0.36, times: [0, 0.35, 0.7, 1], ease: 'easeInOut' }}
            >
                <span className='absolute -inset-2 rounded-full border border-gold/40' />
                <span className='absolute inset-0 rounded-full bg-white shadow-[0_24px_50px_-18px_rgba(58,42,33,0.45)]' />

                <svg viewBox='0 0 1080 1080' className='absolute left-[14%] top-[14%] w-[72%] h-[72%]'>
                    <defs>
                        <mask id={`${id}-n`} maskUnits='userSpaceOnUse' x='0' y='0' width='1080' height='1080'>
                            <MotionPath
                                d={TRACO_N} fill='none' stroke='#fff' strokeWidth={PINCEL}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.02, duration: 0.18, ease: DESENHO }}
                            />
                        </mask>
                        <mask id={`${id}-m`} maskUnits='userSpaceOnUse' x='0' y='0' width='1080' height='1080'>
                            <MotionPath
                                d={TRACO_M} fill='none' stroke='#fff' strokeWidth={PINCEL}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.08, duration: 0.2, ease: DESENHO }}
                            />
                        </mask>
                    </defs>
                    <path d={LETRA_N} fill={COR_N} mask={`url(#${id}-n)`} />
                    <path d={LETRA_M} fill={COR_M} mask={`url(#${id}-m)`} />
                </svg>
            </MotionDiv>
        </MotionDiv>
    )
}

// fundo desfocado + logo. Os tempos de troca e saída contam daqui (de quando
// aparece), pra ficarem no compasso das animações
function Sobreposicao({ rodada, destino, aoTrocar, aoTerminar }) {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [deuTempo, setDeuTempo] = useState(false)
    const chegou = pathname === destino

    // eventos de efeito: enxergam o navigate e o destino mais recentes sem
    // reiniciar os tempos lá embaixo (o navigate muda a cada troca de rota)
    const trocarPagina = useEffectEvent(() => {
        aoTrocar()
        // a troca acontece coberta pelo logo, sem a transição de página por cima
        semTransicaoNaProxima()
        navigate(destino)
    })
    const terminar = useEffectEvent(() => aoTerminar(rodada))

    useEffect(() => {
        const troca = setTimeout(trocarPagina, TROCA_MS)
        const minimo = setTimeout(() => setDeuTempo(true), SAIDA_MS)
        const limite = setTimeout(terminar, LIMITE_MS)
        return () => {
            clearTimeout(troca)
            clearTimeout(minimo)
            clearTimeout(limite)
        }
    }, [])

    // some quando já deu o tempo e a página nova já está montada por trás —
    // assim o desfoque nunca sai mostrando a página antiga
    useEffect(() => {
        if (deuTempo && chegou) terminar()
    }, [deuTempo, chegou])

    return (
        <MotionDiv
            aria-hidden='true'
            className='fixed inset-0 z-70 flex items-center justify-center pointer-events-none bg-cream/45 backdrop-blur-[10px]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.16, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.26, ease: 'easeInOut' } }}
        >
            <LogoDesenhando />
        </MotionDiv>
    )
}

// rodada: cada transição monta uma sobreposição nova (key), com os próprios
// tempos. aoCarregar avisa a TransicaoLogo que este pedaço do JS chegou
export default function CamadaTransicao({ ativa, rodada, destino, aoTrocar, aoTerminar, aoCarregar }) {
    useEffect(() => {
        aoCarregar()
    }, [aoCarregar])

    return (
        <LazyMotion features={domAnimation} strict>
            <AnimatePresence>
                {ativa && (
                    <Sobreposicao key={rodada} rodada={rodada} destino={destino} aoTrocar={aoTrocar} aoTerminar={aoTerminar} />
                )}
            </AnimatePresence>
        </LazyMotion>
    )
}
