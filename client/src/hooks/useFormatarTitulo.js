import { useCallback, useContext } from 'react'
import { DadosContext } from '../contexts/DadosContext'
import { formatarTitulo } from '../utils/formatTitulo'

// formatarTitulo já com as marcas das indústrias parceiras (DadosContext) na
// lista de nomes próprios — "bolo com chocolate harald" vira "Bolo com
// chocolate Harald"
export function useFormatarTitulo() {
    const { industrias } = useContext(DadosContext) || {}
    return useCallback(
        texto => formatarTitulo(texto, (industrias || []).map(i => i.nome)),
        [industrias]
    )
}
