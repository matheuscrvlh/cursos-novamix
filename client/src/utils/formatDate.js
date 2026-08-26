export function formatDateBR(dateStr) {
    if (!dateStr) return ''
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano}`
}

// Compara data+hora do curso (campos separados, "YYYY-MM-DD" e "HH:MM") com
// o momento atual — comparar só a data (como antes) deixava um curso de hoje
// às 09h aparecendo como "atual" o dia inteiro, mesmo horas depois de já ter
// passado.
export function cursoEncerrado(curso) {
    if (!curso?.data) return false
    const [ano, mes, dia] = curso.data.split('-')
    const [hora = 0, minuto = 0] = (curso.hora || '').split(':')
    const dataHoraCurso = new Date(ano, mes - 1, dia, hora, minuto)
    return dataHoraCurso < new Date()
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
