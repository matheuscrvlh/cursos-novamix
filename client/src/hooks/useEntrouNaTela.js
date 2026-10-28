import { useEffect, useState } from 'react'

// avisa (uma vez só) quando o elemento entra na tela. Devolve um ref de
// callback — guardado em state, não useRef: o elemento chega assim que monta
// e o observer é refeito se ele trocar
export default function useEntrouNaTela({ rootMargin = '0px 0px -6% 0px', threshold = 0.1 } = {}) {
    const [el, setEl] = useState(null)
    const [visivel, setVisivel] = useState(false)

    useEffect(() => {
        if (!el) return

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisivel(true)
                observer.disconnect()
            }
        }, { rootMargin, threshold })

        observer.observe(el)
        return () => observer.disconnect()
    }, [el, rootMargin, threshold])

    return [setEl, visivel]
}
