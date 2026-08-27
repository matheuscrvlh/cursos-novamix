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

function dataParaInput(data) {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
}

// Padrão do filtro de data em Cursos/Cursos Infantis: de hoje até 2 meses à
// frente, em vez de vir sem limite nenhum (o que listaria cursos de anos).
export function filtroDataPadrao() {
    const hoje = new Date()
    const doisMesesDepois = new Date()
    doisMesesDepois.setMonth(doisMesesDepois.getMonth() + 2)
    return { dataInicial: dataParaInput(hoje), dataFinal: dataParaInput(doisMesesDepois) }
}

// todas as comparações usam o horário local do navegador — datas vindas do
// banco são ISO UTC, e o construtor Date já converte pra hora local sozinho,
// então não precisa de nenhum ajuste manual
export function inicioDoDia(data) {
    // "YYYY-MM-DD" (valor de <input type="date">) precisa ser montado como
    // data local manualmente — new Date("YYYY-MM-DD") interpreta como UTC
    // meia-noite, o que em fusos negativos (Brasil) vira o dia anterior local
    if (typeof data === 'string') {
        const [ano, mes, dia] = data.split('-').map(Number)
        return new Date(ano, mes - 1, dia, 0, 0, 0, 0)
    }
    const d = new Date(data)
    d.setHours(0, 0, 0, 0)
    return d
}

export function inicioDaSemana() {
    const d = inicioDoDia(new Date())
    d.setDate(d.getDate() - d.getDay()) // volta até domingo
    return d
}

export function inicioDoMes() {
    const d = inicioDoDia(new Date())
    d.setDate(1)
    return d
}

// vira dataInicio/dataFim (ISO) pra mandar como query param pro backend em
// vez de filtrar em JS — usado pelos filtros rápidos "Hoje/Ontem/Essa
// semana/Este mês" (inscrições e cadastro de clientes)
export function calcularPeriodoData(filtro, periodoInicio, periodoFim) {
    if (filtro === 'hoje') {
        return { inicio: inicioDoDia(new Date()) }
    }
    if (filtro === 'ontem') {
        const inicioOntem = inicioDoDia(new Date())
        inicioOntem.setDate(inicioOntem.getDate() - 1)
        return { inicio: inicioOntem, fim: inicioDoDia(new Date()) }
    }
    if (filtro === 'semana') {
        return { inicio: inicioDaSemana() }
    }
    if (filtro === 'mes') {
        return { inicio: inicioDoMes() }
    }
    if (filtro === 'periodo') {
        const inicio = periodoInicio ? inicioDoDia(periodoInicio) : undefined
        let fim
        if (periodoFim) {
            fim = inicioDoDia(periodoFim)
            fim.setDate(fim.getDate() + 1) // inclui o dia final inteiro
        }
        return { inicio, fim }
    }
    return {}
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
