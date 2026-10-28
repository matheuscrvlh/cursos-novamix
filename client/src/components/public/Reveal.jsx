import React from 'react'

import useEntrouNaTela from '../../hooks/useEntrouNaTela'

// faz o conteúdo surgir (fade + desfoque saindo + leve subida) quando entra
// na tela, uma vez só. O estado escondido fica no CSS (.reveal, em
// index.css) — quem prefere menos movimento no sistema vê tudo direto
export default function Reveal({
    as = 'div',
    delay = 0,
    className = '',
    children,
    ...props
}) {
    const [ref, visivel] = useEntrouNaTela()

    return React.createElement(
        as,
        {
            ref,
            className: `reveal ${visivel ? 'is-visible' : ''} ${className}`,
            style: delay ? { transitionDelay: `${delay}ms` } : undefined,
            ...props
        },
        children
    )
}
