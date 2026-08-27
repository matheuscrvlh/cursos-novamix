// bg + text juntos (não só o bg) porque "pendente" precisa de texto escuro —
// yellow-base é claro demais pro texto branco que os outros status usam
// ficar legível em cima.
export function statusInscricaoClass(status) {
    if (status === 'pago') return 'bg-green-base text-white'
    if (status === 'pendente') return 'bg-yellow-base text-gray-dark'
    if (status === 'recusado') return 'bg-red-light text-white'
    if (status === 'reembolsado') return 'bg-red-base text-white'
    return 'bg-gray-base text-white'
}
