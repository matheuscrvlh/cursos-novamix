import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { rolagemSuaveAtiva, rolarPara } from '../utils/rolagemSuave'

export default function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        // com a rolagem suave ligada, a troca de página vai pro topo pela
        // própria Lenis (ver rolarPara)
        if (rolagemSuaveAtiva()) rolarPara(0, { imediato: true })
        else window.scrollTo({ top: 0, left: 0 })
    }, [pathname])

    return null
}
