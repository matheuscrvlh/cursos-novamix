import { useContext, useEffect, useState } from 'react'

import { DadosContext } from '../../contexts/DadosContext'
import { cursoEncerrado } from '../../utils/formatDate'
import useEntrouNaTela from '../../hooks/useEntrouNaTela'

import Parallax from '../../components/public/Parallax'
import SectionHeader from '../../components/public/SectionHeader'
import { Macaron, Morango, Framboesa, Folha, Cereja, Bombom, Brilho, PratoDeDoces } from '../../components/public/Doces'

// Doces flutuando em volta do título (inspirado nos ingredientes do
// sushibar.framer.website). Cada um tem três movimentos, em elementos
// separados pra um não brigar com o outro:
//  - profundidade ao rolar (Parallax, `vel`): os maiores andam mais, como se
//    estivessem mais perto
//  - entrada quando a seção aparece: crescem de 50% e caem de cima, em
//    sequência
//  - flutuação lenta e contínua (index.css, animate-flutuar), cada um no
//    próprio ritmo pra não balançarem juntos
// Posições em % da seção, em três faixas: até o lg (celular e tablet) só os
// de `celular: true`, menores e nas bordas; do lg ao xl todos, mais pra fora
// (o texto ocupa quase tudo); do xl pra cima, mais perto do título
const DOCES = [
    { Svg: Folha, pos: 'top-[3%] left-[3%]', tam: 'w-12 lg:w-20', rot: -28, vel: 0.1, dur: 7.5, dist: 12, giro: 4, celular: true },
    { Svg: Macaron, props: { sabor: 'framboesa' }, pos: 'top-[12%] -left-[5%] lg:left-[3%] xl:left-[11%]', tam: 'w-16 lg:w-28 xl:w-32', rot: -14, vel: 0.16, dur: 9, dist: 14, giro: 3, celular: true },
    { Svg: Brilho, pos: 'top-[30%] lg:left-[16%] xl:left-[24%]', tam: 'w-6', rot: 0, vel: 0.05, dur: 5, dist: 6, giro: 12 },
    { Svg: Framboesa, pos: 'top-[42%] left-[4%]', tam: 'w-10 lg:w-16', rot: 18, vel: 0.22, dur: 8, dist: 10, giro: 6, celular: true },
    { Svg: Bombom, pos: 'top-[63%] lg:left-[5%] xl:left-[13%]', tam: 'w-20', rot: 0, vel: 0.12, dur: 10, dist: 12, giro: 5 },
    { Svg: Macaron, props: { sabor: 'baunilha' }, pos: 'top-[80%] left-[4%]', tam: 'w-24', rot: 12, vel: 0.08, dur: 8.5, dist: 10, giro: 3 },

    { Svg: Folha, pos: 'top-[1%] -right-[1%]', tam: 'w-16', rot: 42, vel: 0.06, dur: 6.5, dist: 10, giro: 5 },
    { Svg: Cereja, pos: 'top-[5%] right-[6%] lg:right-[8%] xl:right-[17%]', tam: 'w-14 lg:w-24', rot: 12, vel: 0.12, dur: 8, dist: 12, giro: 4, celular: true },
    { Svg: Brilho, pos: 'top-[20%] lg:right-[22%] xl:right-[30%]', tam: 'w-5', rot: 0, vel: 0.04, dur: 4.5, dist: 5, giro: 15 },
    { Svg: Macaron, props: { sabor: 'pistache' }, pos: 'top-[33%] right-[3%] lg:right-[4%] xl:right-[6%]', tam: 'w-16 lg:w-28 xl:w-32', rot: 16, vel: 0.2, dur: 9.5, dist: 14, giro: 3, celular: true },
    { Svg: Morango, pos: 'top-[60%] lg:right-[5%] xl:right-[12%]', tam: 'w-20', rot: -18, vel: 0.14, dur: 7, dist: 12, giro: 5 },
    { Svg: Macaron, props: { sabor: 'lavanda' }, pos: 'top-[82%] right-[4%]', tam: 'w-20', rot: -10, vel: 0.1, dur: 8, dist: 10, giro: 3 },
]

function DoceFlutuante({ doce, indice, visivel }) {
    const { Svg, props, pos, tam, rot, vel, dur, dist, giro, celular } = doce

    return (
        <Parallax velocidade={vel} className={`absolute ${pos} ${tam} ${celular ? '' : 'hidden lg:block'}`}>
            <div
                className={`transition duration-[1600ms] ease-luxo ${visivel ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-16'}`}
                style={{ transitionDelay: `${indice * 90}ms` }}
            >
                {/* atraso negativo: cada um já começa num ponto diferente do vaivém */}
                <div
                    className='animate-flutuar'
                    style={{ '--dur': `${dur}s`, '--dist': `${dist}px`, '--giro': `${giro}deg`, animationDelay: `-${(indice * 1.7) % dur}s` }}
                >
                    <Svg {...props} className='w-full h-auto drop-shadow-[0_18px_16px_rgba(58,42,33,0.16)]' style={{ rotate: `${rot}deg` }} />
                </div>
            </div>
        </Parallax>
    )
}

// conta de 0 até o valor quando a seção aparece (e de novo se o valor mudar,
// ex: os dados chegando depois)
function Contador({ valor, ativo }) {
    const [atual, setAtual] = useState(0)

    useEffect(() => {
        if (!ativo) return
        const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const duracao = reduzir ? 0 : 1600
        let inicio = null
        let quadro

        function passo(agora) {
            if (inicio === null) inicio = agora
            const p = duracao ? Math.min((agora - inicio) / duracao, 1) : 1
            setAtual(Math.round(valor * (1 - Math.pow(1 - p, 3))))
            if (p < 1) quadro = requestAnimationFrame(passo)
        }

        quadro = requestAnimationFrame(passo)
        return () => cancelAnimationFrame(quadro)
    }, [valor, ativo])

    return atual
}

export default function AtelierSections() {
    const { cursos, cursosInfantis, culinaristas, industrias } = useContext(DadosContext)
    const [ref, visivel] = useEntrouNaTela({ threshold: 0.2 })

    const cursosRealizados = [...cursos, ...cursosInfantis].filter(cursoEncerrado).length

    // só números de verdade, vindos dos dados do site — o que der 0 (dados
    // ainda carregando ou sem cadastro) não aparece
    const numeros = [
        { valor: cursosRealizados, rotulo: 'cursos realizados' },
        { valor: culinaristas.length, rotulo: 'culinaristas parceiros' },
        { valor: industrias.length, rotulo: 'marcas parceiras' },
        { valor: 2, rotulo: 'lojas Novamix' },
    ].filter(n => n.valor > 0)

    return (
        <section ref={ref} className='relative w-full overflow-hidden pt-24 md:pt-32'>

            <div aria-hidden='true' className='pointer-events-none absolute inset-0'>
                {DOCES.map((doce, i) => (
                    <DoceFlutuante key={i} doce={doce} indice={i} visivel={visivel} />
                ))}
            </div>

            <div className='relative max-w-2xl mx-auto px-8'>
                <SectionHeader
                    eyebrow='Feito à mão'
                    titulo='Doçura em cada'
                    destaque='detalhe.'
                    descricao='Aulas presenciais nas lojas Novamix, com culinaristas parceiros mostrando cada etapa, do preparo à finalização.'
                    className='mb-10 md:mb-12'
                />

                {numeros.length > 0 && (
                    <dl className='grid grid-cols-2 sm:grid-cols-4 gap-y-6 max-w-xl mx-auto'>
                        {numeros.map((n, i) => (
                            // rótulo (dt) antes do número (dd) no HTML, como pede o <dl>;
                            // o flex-col-reverse põe o número em cima na tela, e o
                            // justify-end (que no reverso é o topo) alinha os números
                            // mesmo com rótulo de uma linha só
                            <div
                                key={n.rotulo}
                                className={`flex flex-col-reverse justify-end items-center text-center px-2 transition duration-[1200ms] ease-luxo ${visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${i > 0 ? 'sm:border-l sm:border-gold/30' : ''}`}
                                style={{ transitionDelay: `${300 + i * 120}ms` }}
                            >
                                <dt className='text-[0.625rem] font-medium uppercase tracking-[0.22em] text-cocoa mt-2'>{n.rotulo}</dt>
                                <dd className='font-serif text-[2.75rem] md:text-[3.25rem] font-bold text-chocolate leading-none'>
                                    <Contador valor={n.valor} ativo={visivel} />
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>

            {/* prato subindo por baixo, cortado pela faixa que vem logo depois.
                O anel dourado e o prato andam em velocidades diferentes ao
                rolar — dá a sensação de profundidade */}
            <div className='relative mt-14 md:mt-20 mx-auto w-full max-w-[60rem] aspect-[100/56] overflow-hidden' aria-hidden='true'>
                <Parallax velocidade={-0.1} className='absolute inset-x-[2%] top-0'>
                    <div className='aspect-square rounded-full border-2 border-gold/60' />
                </Parallax>
                <Parallax velocidade={-0.04} className='absolute inset-x-[7%] top-[5%]'>
                    <PratoDeDoces className='w-full h-auto' />
                </Parallax>
            </div>
        </section>
    )
}
