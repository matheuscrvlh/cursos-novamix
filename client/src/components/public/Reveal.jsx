import React, { useEffect, useState } from 'react'

// faz o conteúdo surgir (fade + leve subida) quando entra na tela, uma vez
// só. O estado escondido fica no CSS (.reveal, em index.css) — quem prefere
// menos movimento no sistema vê tudo direto, sem animação
export default function Reveal({
    as = 'div',
    delay = 0,
    className = '',
    children,
    ...props
}) {
    // ref de callback (guardado em state) em vez de useRef: o elemento chega
    // aqui assim que monta, e o efeito roda de novo se ele trocar
    const [el, setEl] = useState(null)
    const [visivel, setVisivel] = useState(false)

    useEffect(() => {
        if (!el) return

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisivel(true)
                observer.disconnect()
            }
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 })

        observer.observe(el)
        return () => observer.disconnect()
    }, [el])

    return React.createElement(
        as,
        {
            ref: setEl,
            className: `reveal ${visivel ? 'is-visible' : ''} ${className}`,
            style: delay ? { transitionDelay: `${delay}ms` } : undefined,
            ...props
        },
        children
    )
}
