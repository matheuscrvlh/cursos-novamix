// Exibição, não digitação — o CPF já vem completo do backend (decifrado),
// só formata 000.000.000-00 pra mostrar/imprimir.
export function formatarCpf(cpf) {
    const digits = (cpf || '').replace(/\D/g, '')
    if (digits.length !== 11) return cpf || '—'
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
