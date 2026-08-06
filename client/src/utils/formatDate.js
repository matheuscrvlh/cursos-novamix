export function formatDateBR(dateStr) {
    if (!dateStr) return ''
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano}`
}

export function formatDateTimeBR(isoStr) {
    if (!isoStr) return ''
    const data = new Date(isoStr)
    if (Number.isNaN(data.getTime())) return ''

    const dia    = String(data.getDate()).padStart(2, '0')
    const mes    = String(data.getMonth() + 1).padStart(2, '0')
    const ano    = data.getFullYear()
    const horas  = String(data.getHours()).padStart(2, '0')
    const minutos = String(data.getMinutes()).padStart(2, '0')

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`
}
