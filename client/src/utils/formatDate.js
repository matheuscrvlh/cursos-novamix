export function formatDateBR(dateStr) {
    if (!dateStr) return ''
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano}`
}

export function formatDateTimeBR(isoStr) {
    if (!isoStr) return ''
    return formatDateBR(isoStr.split('T')[0])
}
