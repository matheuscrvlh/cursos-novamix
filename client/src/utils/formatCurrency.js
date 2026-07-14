export function formatarPreco(valor) {
    const numero = Number(valor);
    if (isNaN(numero)) return '0,00';
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
