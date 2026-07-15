import { useEffect } from 'react'

// trava o scroll fixando o body na posicao atual, em vez de so mudar
// overflow — isso evita o "pulo"/zoom que o navegador mobile da quando
// a barra de endereco recolhe/expande ao (des)travar o scroll
export default function useBodyScrollLock(isLocked) {
    useEffect(() => {
        if (!isLocked) return

        const scrollY = window.scrollY
        const { body } = document

        body.style.position = 'fixed'
        body.style.top = `-${scrollY}px`
        body.style.left = '0'
        body.style.right = '0'

        return () => {
            body.style.position = ''
            body.style.top = ''
            body.style.left = ''
            body.style.right = ''
            window.scrollTo(0, scrollY)
        }
    }, [isLocked])
}
