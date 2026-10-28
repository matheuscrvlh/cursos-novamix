import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { Macaron, Morango, Cereja, Folha, Brilho } from './Doces'
import { LETRA_N, LETRA_M, COR_N, COR_M, TRACO_N, TRACO_M, PINCEL } from './logoNovamix'

// Saudação de quem chega no site: a logo da Novamix se desenha num selo, os
// doces do ateliê caem em volta e aparece "Bom dia / Boa tarde / Boa noite!
// Que bom ter você na Novamix". Uma vez a cada 12 horas por navegador, fora do
// painel admin e de quem pede menos movimento no sistema. Some sozinha em
// ~2,6s, ou antes com qualquer toque, rolagem ou tecla.
//
// As animações são em CSS (index.css, "saudação"), não no Motion: ela aparece
// junto com a primeira página, e o Motion só chega depois, num pedaço separado
// do JS (CamadaTransicao). Os tempos (s) contam de quando ela aparece:
//  0.05  selo entra · 0.14 "n" se desenha · 0.24 "m"
//  0.30  doces caem em volta, um atrás do outro
//  0.50  letras prontas: pulinho, onda e faíscas
//  0.55  "Boa tarde!" desembaça · 0.78 "Que bom ter você na Novamix"
//  2.20  tudo sobe um pouco e some em 0.4s
const CHAVE = 'novamix:saudacao'
const INTERVALO_MS = 12 * 60 * 60 * 1000
const FICA_MS = 2200

const PASSA_DO_PONTO = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const LUXO = 'cubic-bezier(0.22, 1, 0.36, 1)'
const anima = (nome, duracao, curva, atraso, preenche = 'both') =>
    ({ animation: `${nome} ${duracao}s ${curva} ${atraso}s ${preenche}` })

// doces em volta do selo: posição e largura em % do selo, giro e ritmo da
// flutuação (a mesma dos doces do ateliê, animate-flutuar)
const DOCES = [
    { Svg: Folha, pos: 'left-[-34%] top-[-30%]', tam: 'w-[28%]', rot: -28, dur: 6.5 },
    { Svg: Macaron, props: { sabor: 'framboesa' }, pos: 'left-[-70%] top-[14%]', tam: 'w-[50%]', rot: -14, dur: 8 },
    { Svg: Cereja, pos: 'right-[-50%] top-[-32%]', tam: 'w-[38%]', rot: 12, dur: 7.5 },
    { Svg: Macaron, props: { sabor: 'pistache' }, pos: 'right-[-72%] top-[46%]', tam: 'w-[48%]', rot: 16, dur: 9 },
    { Svg: Morango, pos: 'left-[-52%] top-[72%]', tam: 'w-[32%]', rot: -18, dur: 7 },
]

// faíscas que saem do selo: ângulo (0 = direita, sentido horário) e distância
// final do centro — as mesmas da troca de página pelo menu
const FAISCAS = [
    { ang: -90, dist: 106, tam: 'w-5' },
    { ang: -28, dist: 98, tam: 'w-4' },
    { ang: 32, dist: 110, tam: 'w-5' },
    { ang: 90, dist: 100, tam: 'w-4' },
    { ang: 148, dist: 108, tam: 'w-5' },
    { ang: 210, dist: 96, tam: 'w-4' },
]

function deveSaudar(pathname) {
    if (pathname.endsWith('Admin')) return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try {
        return Date.now() - (Number(localStorage.getItem(CHAVE)) || 0) >= INTERVALO_MS
    } catch {
        // sem como lembrar (armazenamento bloqueado), apareceria a cada refresh
        return false
    }
}

function saudacaoDaHora(hora) {
    if (hora >= 5 && hora < 12) return 'Bom dia!'
    if (hora >= 12 && hora < 18) return 'Boa tarde!'
    return 'Boa noite!'
}

// cai girando, passando um pouco do tamanho, e fica flutuando
function Doce({ doce, indice }) {
    const { Svg, props, pos, tam, rot, dur } = doce

    return (
        <div className={`absolute ${pos} ${tam}`}>
            <div style={anima('saudacao-doce', 0.7, PASSA_DO_PONTO, 0.3 + indice * 0.07)}>
                <div className='animate-flutuar' style={{ '--dur': `${dur}s`, '--dist': '6px', '--giro': '4deg', animationDelay: `-${indice * 1.3}s` }}>
                    <Svg {...props} className='w-full h-auto drop-shadow-[0_14px_12px_rgba(58,42,33,0.16)]' style={{ rotate: `${rot}deg` }} />
                </div>
            </div>
        </div>
    )
}

function Selo() {
    return (
        <div className='absolute inset-0' style={anima('saudacao-selo', 0.5, PASSA_DO_PONTO, 0.05)}>
            {FAISCAS.map(({ ang, dist, tam }, i) => (
                <span
                    key={i}
                    className={`absolute left-1/2 top-1/2 ${tam} aspect-square -translate-x-1/2 -translate-y-1/2`}
                    style={{ '--ang': `${ang}deg`, '--dist': `${dist}px`, ...anima('saudacao-faisca', 0.5, 'ease-out', 0.52 + i * 0.015) }}
                >
                    <Brilho className='w-full h-full' />
                </span>
            ))}

            {/* onda que sai do selo quando as letras terminam */}
            <span
                className='absolute inset-0 rounded-full border-2 border-orange-base/45 opacity-0'
                style={anima('saudacao-onda', 0.55, 'ease-out', 0.52, 'forwards')}
            />

            {/* pulinho do selo no fim do desenho */}
            <div className='absolute inset-0' style={anima('saudacao-pulo', 0.36, 'ease-in-out', 0.5)}>
                <span className='absolute -inset-2 rounded-full border border-gold/40' />
                <span className='absolute inset-0 rounded-full bg-white shadow-[0_24px_50px_-18px_rgba(58,42,33,0.45)]' />

                {/* cada letra aparece por uma máscara: um "pincel" grosso passando
                    pela linha central do traço (pathLength 1 → stroke-dasharray) */}
                <svg viewBox='0 0 1080 1080' className='absolute left-[14%] top-[14%] w-[72%] h-[72%]'>
                    <defs>
                        <mask id='saudacao-n' maskUnits='userSpaceOnUse' x='0' y='0' width='1080' height='1080'>
                            <path
                                d={TRACO_N} pathLength='1' fill='none' stroke='#fff' strokeWidth={PINCEL}
                                style={anima('saudacao-traco', 0.26, 'cubic-bezier(0.45, 0, 0.25, 1)', 0.14)}
                            />
                        </mask>
                        <mask id='saudacao-m' maskUnits='userSpaceOnUse' x='0' y='0' width='1080' height='1080'>
                            <path
                                d={TRACO_M} pathLength='1' fill='none' stroke='#fff' strokeWidth={PINCEL}
                                style={anima('saudacao-traco', 0.28, 'cubic-bezier(0.45, 0, 0.25, 1)', 0.24)}
                            />
                        </mask>
                    </defs>
                    <path d={LETRA_N} fill={COR_N} mask='url(#saudacao-n)' />
                    <path d={LETRA_M} fill={COR_M} mask='url(#saudacao-m)' />
                </svg>
            </div>
        </div>
    )
}

export default function Saudacao() {
    const { pathname } = useLocation()
    // decide uma vez, na primeira página aberta: 'na-tela' → 'saindo' → 'fora'
    const [fase, setFase] = useState(() => (deveSaudar(pathname) ? 'na-tela' : 'fora'))
    const [saudacao] = useState(() => saudacaoDaHora(new Date().getHours()))
    const visivel = fase !== 'fora'

    const sair = useCallback(() => setFase(f => (f === 'na-tela' ? 'saindo' : f)), [])

    useEffect(() => {
        if (!visivel) return
        try { localStorage.setItem(CHAVE, String(Date.now())) } catch { /* ver deveSaudar */ }
        const tempo = setTimeout(sair, FICA_MS)
        window.addEventListener('keydown', sair)
        return () => {
            clearTimeout(tempo)
            window.removeEventListener('keydown', sair)
        }
    }, [visivel, sair])

    if (!visivel) return null

    const palavras = saudacao.split(' ')
    const saindo = fase === 'saindo'

    return (
        // por cima de tudo e pegando o toque: o mesmo toque que a dispensa não
        // pode cair num link da página enquanto ela some
        <div
            aria-hidden='true'
            onPointerDown={sair}
            onWheel={sair}
            onAnimationEnd={e => { if (e.animationName === 'saudacao-sai') setFase('fora') }}
            className='fixed inset-0 z-80 flex items-center justify-center px-5 bg-cream/70 backdrop-blur-[14px] cursor-pointer select-none'
            style={saindo ? anima('saudacao-sai', 0.4, 'ease-in-out', 0, 'forwards') : undefined}
        >
            <div
                className='flex flex-col items-center text-center'
                style={saindo ? anima('saudacao-sobe', 0.4, 'ease-in', 0, 'forwards') : undefined}
            >
                <div className='relative w-32 h-32 md:w-36 md:h-36'>
                    {DOCES.map((doce, i) => <Doce key={i} doce={doce} indice={i} />)}

                    <Selo />
                </div>

                <p className='mt-9 md:mt-10 font-serif italic text-[2.75rem] md:text-[3.5rem] font-bold text-chocolate leading-none'>
                    {palavras.map((palavra, i) => (
                        <span key={i} className='inline-block' style={anima('saudacao-texto', 0.7, LUXO, 0.55 + i * 0.09)}>
                            {palavra}{i < palavras.length - 1 && ' '}
                        </span>
                    ))}
                </p>

                <p className='mt-4 flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] sm:tracking-[0.28em] text-cocoa'>
                    <span className='w-5 sm:w-9 h-px bg-gold/50 origin-right' style={anima('saudacao-linha', 0.8, LUXO, 0.85)} />
                    <span style={anima('saudacao-texto', 0.7, LUXO, 0.78)}>Que bom ter você na Novamix</span>
                    <span className='w-5 sm:w-9 h-px bg-gold/50 origin-left' style={anima('saudacao-linha', 0.8, LUXO, 0.85)} />
                </p>
            </div>
        </div>
    )
}
