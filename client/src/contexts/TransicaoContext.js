import { createContext, useContext } from 'react'

// troca de página com a animação do logo (components/public/TransicaoLogo,
// em volta das rotas no App). navegarComTransicao(to) devolve false quando
// não vai animar (já está na página, "reduzir movimento" ligado ou fora do
// provider) — aí o link segue o caminho normal
export const TransicaoContext = createContext({ navegarComTransicao: () => false })

export function useTransicao() {
    return useContext(TransicaoContext)
}
