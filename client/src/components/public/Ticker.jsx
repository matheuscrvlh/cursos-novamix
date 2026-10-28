import { Children, useEffect, useRef, useState } from 'react'

// Faixa que corre sozinha pro lado (o "ticker" dos sites do Framer). Os itens
// se repetem até passar da largura da faixa, e essa sequência vem duplicada:
// a animação (index.css, @keyframes ticker) anda uma cópia inteira e emenda o
// fim no começo sem salto. Para com o mouse em cima. A duração sai da largura
// medida, pra velocidade (px/s) ser a mesma em qualquer tela
export default function Ticker({ children, velocidade = 40, separador = null, className = '' }) {
    const faixaRef = useRef(null)
    const trilhoRef = useRef(null)
    const copiaRef = useRef(null)
    const [repeticoes, setRepeticoes] = useState(1)

    const itens = Children.toArray(children)

    useEffect(() => {
        const faixa = faixaRef.current
        const copia = copiaRef.current
        if (!faixa || !copia) return

        const observer = new ResizeObserver(() => {
            const larguraBase = copia.scrollWidth / repeticoes
            if (!larguraBase) return
            const precisa = Math.max(1, Math.ceil(faixa.clientWidth / larguraBase))
            if (precisa !== repeticoes) {
                setRepeticoes(precisa)
                return
            }
            trilhoRef.current.style.setProperty('--ticker-dur', `${(larguraBase * repeticoes) / velocidade}s`)
        })

        observer.observe(faixa)
        observer.observe(copia)
        return () => observer.disconnect()
    }, [repeticoes, velocidade])

    if (itens.length === 0) return null

    const sequencia = Array.from({ length: repeticoes }, (_, r) =>
        itens.map((item, i) => (
            <span key={`${r}-${i}`} className='flex items-center shrink-0'>
                {item}
                {separador}
            </span>
        ))
    )

    return (
        <div ref={faixaRef} className={`overflow-hidden ${className}`}>
            <div ref={trilhoRef} className='flex w-max animate-ticker hover:[animation-play-state:paused]'>
                <div ref={copiaRef} className='flex shrink-0'>{sequencia}</div>
                {/* a cópia só existe pro emendo: fora do leitor de tela e do Tab */}
                <div className='flex shrink-0' aria-hidden='true' inert>{sequencia}</div>
            </div>
        </div>
    )
}
