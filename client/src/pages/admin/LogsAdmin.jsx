import { useContext, useEffect, useState } from 'react'
import { Inbox, Search, Loader2, ShieldAlert } from 'lucide-react'

import CardDash from '../../components/admin/CardDash'
import FilterPills from '../../components/admin/FilterPills'
import AdminPage from '../../layouts/admin/AdminPage'

import { getLogs, getLogsFiltrosDisponiveis } from '../../api/logs.services'
import { AdminAuthContext } from '../../contexts/AdminAuthContext'
import { formatDateTimeBR, calcularPeriodoData } from '../../utils/formatDate'

const FILTROS_PERIODO = [
    { label: 'Todos', value: 'todos' },
    { label: 'Hoje', value: 'hoje' },
    { label: 'Ontem', value: 'ontem' },
    { label: 'Essa semana', value: 'semana' },
    { label: 'Este mês', value: 'mes' },
]

// primeira letra maiúscula pra qualquer tipo/ação nova que ainda não tenha
// rótulo mapeado aqui — evita a tela quebrar quando um logAudit novo aparecer
function capitalizar(valor) {
    if (!valor) return valor
    return valor.charAt(0).toUpperCase() + valor.slice(1).replaceAll('_', ' ')
}

const LABELS_TIPO = {
    curso: 'Curso',
    inscricao: 'Inscrição',
    cliente: 'Cliente',
    culinarista: 'Culinarista',
    industria: 'Indústria',
    banner: 'Banner',
}

const LABELS_ACAO = {
    criar: 'Criar',
    editar: 'Editar',
    excluir: 'Excluir',
    ativar: 'Ativar',
    desativar: 'Desativar',
    reembolsar: 'Reembolsar',
    redefinir_senha: 'Redefinir senha',
}

function acaoClass(acao) {
    if (acao === 'criar' || acao === 'ativar') return 'bg-green-base text-white'
    if (acao === 'excluir') return 'bg-red-base text-white'
    if (acao === 'reembolsar') return 'bg-red-light text-white'
    if (acao === 'desativar') return 'bg-gray-base text-white'
    if (acao === 'editar' || acao === 'redefinir_senha') return 'bg-blue-base text-white'
    return 'bg-gray-base text-white'
}

// nome + id (nome pode faltar se o usuário do hub foi excluído depois do
// log já ter sido gravado — usuario_hub_id fica órfão, mas o log continua)
function usuarioLabel(log) {
    if (!log.usuarioHubId) return '—'
    return log.usuarioNome ? `${log.usuarioNome} (#${log.usuarioHubId})` : `#${log.usuarioHubId}`
}

export default function LogsAdmin() {
    const { isAdmin, loading: carregandoAuth } = useContext(AdminAuthContext)

    const [logs, setLogs] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [busca, setBusca] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [filtroAcao, setFiltroAcao] = useState('todos')
    const [filtroPeriodo, setFiltroPeriodo] = useState('hoje')
    const [filtrosDisponiveis, setFiltrosDisponiveis] = useState({ tiposEntidade: [], acoes: [] })

    useEffect(() => {
        if (!isAdmin) return
        getLogsFiltrosDisponiveis().then(setFiltrosDisponiveis)
    }, [isAdmin])

    useEffect(() => {
        if (!isAdmin) return

        const { inicio, fim } = calcularPeriodoData(filtroPeriodo)

        const buscarLogs = () => {
            setCarregando(true)
            getLogs({
                busca,
                tipoEntidade: filtroTipo === 'todos' ? undefined : filtroTipo,
                acao: filtroAcao === 'todos' ? undefined : filtroAcao,
                dataInicio: inicio?.toISOString(),
                dataFim: fim?.toISOString(),
            })
                .then(setLogs)
                .finally(() => setCarregando(false))
        }

        const atraso = busca ? 300 : 0
        const t = setTimeout(buscarLogs, atraso)
        return () => clearTimeout(t)
    }, [isAdmin, busca, filtroTipo, filtroAcao, filtroPeriodo])

    const opcoesTipo = [
        { label: 'Todos', value: 'todos' },
        ...filtrosDisponiveis.tiposEntidade.map(t => ({ label: LABELS_TIPO[t] || capitalizar(t), value: t })),
    ]
    const opcoesAcao = [
        { label: 'Todas', value: 'todos' },
        ...filtrosDisponiveis.acoes.map(a => ({ label: LABELS_ACAO[a] || capitalizar(a), value: a })),
    ]

    if (!carregandoAuth && !isAdmin) {
        return (
            <AdminPage title='Logs'>
                <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm flex flex-col items-center gap-3 text-center'>
                    <ShieldAlert size={36} className='text-gray-base/40' />
                    <p className='font-semibold text-gray-text'>Acesso restrito</p>
                    <p className='text-sm text-gray-text/60'>Essa tela é exclusiva pra administradores do módulo Cursos.</p>
                </CardDash>
            </AdminPage>
        )
    }

    return (
        <AdminPage title='Logs'>
            <CardDash className='bg-white h-full w-full rounded-md p-4 md:p-10 shadow-sm'>
                <div className='flex flex-col gap-3 mb-4'>
                    <p className='font-bold text-xl text-gray-text'>LOGS DE AUDITORIA</p>
                    <div className='relative w-full md:max-w-xs'>
                        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-text/40' />
                        <input
                            type='text'
                            placeholder='Buscar por ID ou detalhes'
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className='w-full text-sm border border-gray-base/30 rounded-md pl-9 pr-3 py-2 text-gray-text outline-none focus:border-orange-base'
                        />
                    </div>
                    <div className='flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2'>
                        <FilterPills value={filtroTipo} onChange={setFiltroTipo} options={opcoesTipo} activeClass='bg-orange-base text-white' />
                        <span className='hidden md:block w-px h-5 bg-gray-base/30' />
                        <FilterPills value={filtroAcao} onChange={setFiltroAcao} options={opcoesAcao} activeClass='bg-gray-text text-white' />
                    </div>
                    <FilterPills value={filtroPeriodo} onChange={setFiltroPeriodo} options={FILTROS_PERIODO} activeClass='bg-blue-base text-white' />
                </div>
                <hr className='border-gray-base/30 w-full mb-4' />

                <div className='max-h-150 overflow-y-auto'>
                    <div className='hidden md:grid grid-cols-[1fr_0.8fr_0.8fr_1.5fr_1.7fr_0.9fr] gap-2
                                    text-xs font-semibold text-gray-text uppercase tracking-wider
                                    bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                        <p>DATA/HORA</p>
                        <p>TIPO</p>
                        <p>AÇÃO</p>
                        <p>ID DA ENTIDADE</p>
                        <p>DETALHES</p>
                        <p>USUÁRIO</p>
                    </div>

                    {carregando ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Loader2 size={28} className='animate-spin text-orange-base' /><p className='text-sm'>Carregando...</p></div>
                    ) : logs.length === 0 ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhum log encontrado</p></div>
                    ) : logs.map(log => (
                        <div key={log.id}>
                            <div className='p-3 text-gray-text md:hidden'>
                                <div className='flex items-center justify-between gap-2 mb-1'>
                                    <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-orange-base/10 text-orange-base'>
                                        {LABELS_TIPO[log.tipoEntidade] || capitalizar(log.tipoEntidade)}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${acaoClass(log.acao)}`}>
                                        {LABELS_ACAO[log.acao] || capitalizar(log.acao)}
                                    </span>
                                </div>
                                {log.detalhes && <p className='text-sm font-medium'>{log.detalhes}</p>}
                                <p className='text-xs text-gray-text/50 mt-0.5'>ID: {log.entidadeId}</p>
                                <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-text/60 mt-1'>
                                    <span>{formatDateTimeBR(log.criadoEm)}</span>
                                    <span>{usuarioLabel(log)}</span>
                                </div>
                            </div>

                            <div className='hidden md:grid grid-cols-[1fr_0.8fr_0.8fr_1.5fr_1.7fr_0.9fr] gap-2
                                            px-3 py-3 items-center text-gray-text text-sm
                                            hover:bg-gray/60 transition-colors rounded-md'>
                                <p className='text-xs'>{formatDateTimeBR(log.criadoEm)}</p>
                                <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-orange-base/10 text-orange-base'>
                                    {LABELS_TIPO[log.tipoEntidade] || capitalizar(log.tipoEntidade)}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${acaoClass(log.acao)}`}>
                                    {LABELS_ACAO[log.acao] || capitalizar(log.acao)}
                                </span>
                                <p className='truncate text-xs text-gray-text/70'>{log.entidadeId}</p>
                                <p className='truncate'>{log.detalhes || '—'}</p>
                                <p className='text-xs truncate'>{usuarioLabel(log)}</p>
                            </div>
                            <hr className='border-gray-base/20' />
                        </div>
                    ))}
                </div>
            </CardDash>
        </AdminPage>
    )
}
