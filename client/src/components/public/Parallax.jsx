import { useEffect, useRef } from 'react'

// Profundidade ao rolar: o conteúdo anda numa velocidade diferente da página,
// proporcional à distância do centro da tela (velocidade 0.1 = 10% dessa
// distância; negativa anda pro outro lado). Mede o elemento de fora e mexe só
// no de dentro, senão o próprio deslocamento entrava na medida.
//
// Um ouvinte de rolagem só pra todos os elementos, um quadro por vez. Com a
// rolagem suave ligada a Lenis rola a janela de verdade, então o evento de
// scroll chega a cada quadro da animação dela
const itens = new Set()
let agendado = false

function atualizar() {
    agendado = false
    const meioTela = window.innerHeight / 2
    for (const item of itens) {
        const r = item.medir.getBoundingClientRect()
        // longe da tela não precisa calcular
        if (r.bottom < -window.innerHeight || r.top > window.innerHeight * 2) continue
        const distancia = r.top + r.height / 2 - meioTela
        item.mover.style.transform = `translate3d(0, ${(-distancia * item.velocidade).toFixed(1)}px, 0)`
    }
}

function agendar() {
    if (agendado) return
    agendado = true
    requestAnimationFrame(atualizar)
}

function registrar(item) {
    if (itens.size === 0) {
        window.addEventListener('scroll', agendar, { passive: true })
        window.addEventListener('resize', agendar)
    }
    itens.add(item)
    agendar()

    return () => {
        itens.delete(item)
        item.mover.style.transform = ''
        if (itens.size === 0) {
            window.removeEventListener('scroll', agendar)
            window.removeEventListener('resize', agendar)
        }
    }
}

export default function Parallax({ velocidade = 0.1, className = '', style, children }) {
    const medirRef = useRef(null)
    const moverRef = useRef(null)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        return registrar({ medir: medirRef.current, mover: moverRef.current, velocidade })
    }, [velocidade])

    return (
        <div ref={medirRef} className={className} style={style}>
            <div ref={moverRef} className='will-change-transform'>
                {children}
            </div>
        </div>
    )
}
