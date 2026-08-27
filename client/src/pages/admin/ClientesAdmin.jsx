import { useContext, useEffect, useState } from 'react'
import { Inbox, Search, KeyRound, Ban, CheckCircle2, Trash, Eye, Loader2 } from 'lucide-react'

import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button'
import Modal from '../../components/public/Modal'
import ConfirmModal from '../../components/admin/ModalConfirm'
import FilterPills from '../../components/admin/FilterPills'
import Tooltip from '../../components/admin/Tooltip'
import AdminPage from '../../layouts/admin/AdminPage'

import {
    getClientesAdmin,
    getClienteAdmin,
    enviarRedefinicaoSenhaAdmin,
    atualizarStatusClienteAdmin,
    excluirClienteAdmin,
} from '../../api/clientes.services'

import { AdminAuthContext } from '../../contexts/AdminAuthContext'
import useConfirmAction from '../../hooks/useConfirmAction'
import { formatDateTimeBR, calcularPeriodoData } from '../../utils/formatDate'
import { statusInscricaoClass } from '../../utils/statusInscricao'

const FILTROS_STATUS = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativos' },
    { label: 'Inativos', value: 'inativos' },
]

const FILTROS_CADASTRO = [
    { label: 'Todos', value: 'todos' },
    { label: 'Hoje', value: 'hoje' },
    { label: 'Ontem', value: 'ontem' },
    { label: 'Essa semana', value: 'semana' },
    { label: 'Este mês', value: 'mes' },
]

function statusLabel(status) {
    if (status === 'pago') return 'Pago'
    if (status === 'pendente') return 'Pendente'
    if (status === 'cancelado') return 'Cancelado'
    if (status === 'recusado') return 'Recusado'
    if (status === 'reembolsando') return 'Reembolso em andamento'
    if (status === 'reembolsado') return 'Reembolsado'
    return status
}

export default function ClientesAdmin() {
    const { isAdmin } = useContext(AdminAuthContext)
    const { confirm, ask, handleConfirm, handleCancel } = useConfirmAction()

    const [clientes, setClientes] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [busca, setBusca] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('ativos')
    const [filtroCadastro, setFiltroCadastro] = useState('hoje')

    const [clienteSelecionado, setClienteSelecionado] = useState(null)
    const [carregandoDetalhe, setCarregandoDetalhe] = useState(false)

    const [mensagem, setMensagem] = useState(null)

    function mostrarMensagem(tipo, texto) {
        setMensagem({ tipo, texto })
        setTimeout(() => setMensagem(null), 5000)
    }

    async function carregar() {
        setCarregando(true)
        const { inicio, fim } = calcularPeriodoData(filtroCadastro)
        const data = await getClientesAdmin({
            busca,
            status: filtroStatus,
            criadoInicio: inicio?.toISOString(),
            criadoFim: fim?.toISOString(),
        })
        setClientes(data)
        setCarregando(false)
    }

    useEffect(() => {
        const t = setTimeout(carregar, 300)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca, filtroStatus, filtroCadastro])

    async function abrirDetalhe(id) {
        setCarregandoDetalhe(true)
        const data = await getClienteAdmin(id)
        setClienteSelecionado(data)
        setCarregandoDetalhe(false)
    }

    async function handleRedefinirSenha(cliente) {
        const res = await enviarRedefinicaoSenhaAdmin(cliente.id)
        mostrarMensagem(res.ok ? 'sucesso' : 'erro', res.ok ? `E-mail de redefinição enviado para ${cliente.email}.` : (res.message || 'Erro ao enviar.'))
    }

    async function handleToggleStatus(cliente) {
        const res = await atualizarStatusClienteAdmin(cliente.id, !cliente.status)
        if (!res.ok) return mostrarMensagem('erro', res.message || 'Erro ao atualizar conta.')
        setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, status: !cliente.status } : c))
        mostrarMensagem('sucesso', cliente.status ? 'Conta desativada.' : 'Conta ativada.')
    }

    async function handleExcluir(cliente) {
        const res = await excluirClienteAdmin(cliente.id)
        if (!res.ok) return mostrarMensagem('erro', res.message || 'Erro ao excluir conta.')
        setClientes(prev => prev.filter(c => c.id !== cliente.id))
        mostrarMensagem('sucesso', 'Conta excluída.')
    }

    return (
        <AdminPage title='Clientes'>
            <CardDash className='bg-white h-full w-full rounded-md p-4 md:p-10 shadow-sm'>
                <div className='flex flex-col gap-3 mb-4'>
                    <p className='font-bold text-xl text-gray-text'>CLIENTES</p>
                    <div className='relative w-full md:max-w-xs'>
                        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-text/40' />
                        <input
                            type='text'
                            placeholder='Buscar por nome, e-mail ou CPF'
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className='w-full text-sm border border-gray-base/30 rounded-md pl-9 pr-3 py-2 text-gray-text outline-none focus:border-orange-base'
                        />
                    </div>
                    <FilterPills value={filtroStatus} onChange={setFiltroStatus} options={FILTROS_STATUS} activeClass='bg-green-base text-white' />
                    <FilterPills value={filtroCadastro} onChange={setFiltroCadastro} options={FILTROS_CADASTRO} activeClass='bg-blue-base text-white' />
                </div>
                <hr className='border-gray-base/30 w-full mb-4' />

                <div className='max-h-150 overflow-y-auto'>
                    <div className='hidden md:grid grid-cols-[1.3fr_1.3fr_0.8fr_0.6fr_0.7fr_0.9fr_1fr] gap-2
                                    text-xs font-semibold text-gray-text uppercase tracking-wider
                                    bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                        <p>NOME</p>
                        <p>E-MAIL</p>
                        <p>CPF</p>
                        <p>INSCR. PAGAS</p>
                        <p>STATUS</p>
                        <p>CADASTRO</p>
                        <p>FUNÇÕES</p>
                    </div>

                    {carregando ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Loader2 size={28} className='animate-spin text-orange-base' /><p className='text-sm'>Carregando...</p></div>
                    ) : clientes.length === 0 ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhum cliente encontrado</p></div>
                    ) : clientes.map(c => (
                        <div key={c.id}>
                            <div className='p-3 text-gray-text md:hidden'>
                                <div className='flex items-start justify-between gap-2 mb-1'>
                                    <p className='font-semibold text-sm'>{c.nome}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 text-white ${c.status ? 'bg-green-base' : 'bg-gray-base'}`}>
                                        {c.status ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <p className='text-xs text-gray-text/60'>{c.email}</p>
                                <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-text/60 mt-1'>
                                    <span>{c.totalInscricoes} inscrição(ões) paga(s)</span>
                                    <span>Cadastro: {formatDateTimeBR(c.criadoEm)}</span>
                                </div>
                                <div className='flex gap-2 mt-2'>
                                    <Tooltip label='Ver detalhes'>
                                        <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => abrirDetalhe(c.id)}>
                                            <Eye size={16} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip label='Enviar redefinição de senha'>
                                        <Button className='bg-blue-base p-2 hover:bg-blue-base/80 text-white' onClick={() => handleRedefinirSenha(c)}>
                                            <KeyRound size={16} />
                                        </Button>
                                    </Tooltip>
                                    {isAdmin && (
                                        <Tooltip label={c.status ? 'Desativar' : 'Ativar'}>
                                            <Button className={`p-2 text-white ${c.status ? 'bg-gray-text hover:bg-gray-dark' : 'bg-green-base hover:bg-green-base/80'}`} onClick={() => handleToggleStatus(c)}>
                                                {c.status ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                            </Button>
                                        </Tooltip>
                                    )}
                                    {isAdmin && (
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => ask({
                                                title: 'Excluir conta',
                                                message: `Excluir a conta de "${c.nome}"? As inscrições feitas por essa conta continuam existindo, só perdem o vínculo.`,
                                                variant: 'danger',
                                                confirmLabel: 'Excluir',
                                                onConfirm: () => handleExcluir(c)
                                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>

                            <div className='hidden md:grid grid-cols-[1.3fr_1.3fr_0.8fr_0.6fr_0.7fr_0.9fr_1fr] gap-2
                                            px-3 py-3 items-center text-gray-text text-sm
                                            hover:bg-gray/60 transition-colors rounded-md'>
                                <p className='font-medium truncate'>{c.nome}</p>
                                <p className='truncate'>{c.email}</p>
                                <p>{c.cpf || '—'}</p>
                                <p>{c.totalInscricoes}</p>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit text-white ${c.status ? 'bg-green-base' : 'bg-gray-base'}`}>
                                    {c.status ? 'Ativo' : 'Inativo'}
                                </span>
                                <p className='text-xs'>{formatDateTimeBR(c.criadoEm)}</p>
                                <div className='flex gap-2'>
                                    <Tooltip label='Ver detalhes'>
                                        <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => abrirDetalhe(c.id)}>
                                            <Eye size={16} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip label='Enviar redefinição de senha'>
                                        <Button className='bg-blue-base p-2 hover:bg-blue-base/80 text-white' onClick={() => handleRedefinirSenha(c)}>
                                            <KeyRound size={16} />
                                        </Button>
                                    </Tooltip>
                                    {isAdmin && (
                                        <Tooltip label={c.status ? 'Desativar' : 'Ativar'}>
                                            <Button className={`p-2 text-white ${c.status ? 'bg-gray-text hover:bg-gray-dark' : 'bg-green-base hover:bg-green-base/80'}`} onClick={() => handleToggleStatus(c)}>
                                                {c.status ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                            </Button>
                                        </Tooltip>
                                    )}
                                    {isAdmin && (
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => ask({
                                                title: 'Excluir conta',
                                                message: `Excluir a conta de "${c.nome}"? As inscrições feitas por essa conta continuam existindo, só perdem o vínculo.`,
                                                variant: 'danger',
                                                confirmLabel: 'Excluir',
                                                onConfirm: () => handleExcluir(c)
                                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                            <hr className='border-gray-base/20' />
                        </div>
                    ))}
                </div>
            </CardDash>

            <Modal
                width='90%'
                maxWidth='700px'
                height='auto'
                isOpen={!!clienteSelecionado}
                onClose={() => setClienteSelecionado(null)}
            >
                {carregandoDetalhe ? (
                    <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Loader2 size={28} className='animate-spin text-orange-base' /><p className='text-sm'>Carregando...</p></div>
                ) : clienteSelecionado && (
                    <div className='flex flex-col gap-4'>
                        <div>
                            <p className='text-xl font-bold text-gray-text'>{clienteSelecionado.nome}</p>
                            <p className='text-sm text-gray-text/60'>{clienteSelecionado.email}</p>
                        </div>
                        <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-text/80'>
                            <span><span className='font-medium text-gray-text'>CPF: </span>{clienteSelecionado.cpf || '—'}</span>
                            <span><span className='font-medium text-gray-text'>Celular: </span>{clienteSelecionado.celular || '—'}</span>
                            <span><span className='font-medium text-gray-text'>Cadastro: </span>{formatDateTimeBR(clienteSelecionado.criadoEm)}</span>
                            <span><span className='font-medium text-gray-text'>Último login: </span>{clienteSelecionado.ultimoLogin ? formatDateTimeBR(clienteSelecionado.ultimoLogin) : 'Nunca'}</span>
                        </div>
                        <hr className='border-gray-base/20' />
                        <p className='font-bold text-gray-text text-sm'>INSCRIÇÕES ({clienteSelecionado.inscricoes.length})</p>
                        <div className='flex flex-col gap-2 max-h-80 overflow-y-auto'>
                            {clienteSelecionado.inscricoes.length === 0 ? (
                                <p className='text-sm text-gray-text/50'>Nenhuma inscrição.</p>
                            ) : clienteSelecionado.inscricoes.map(i => (
                                <div key={i.id} className='bg-gray rounded-lg p-3 flex items-center justify-between gap-3'>
                                    <div>
                                        <p className='text-sm font-medium text-gray-text'>{i.nomeCurso}</p>
                                        <p className='text-xs text-gray-text/60'>{i.dataCurso} · Assento {i.assento}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusInscricaoClass(i.status)}`}>{statusLabel(i.status)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {mensagem && (
                <div
                    className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-white cursor-pointer ${
                        mensagem.tipo === 'sucesso' ? 'bg-green-base' : 'bg-red-base'
                    }`}
                    onClick={() => setMensagem(null)}
                >
                    {mensagem.texto}
                </div>
            )}

            <ConfirmModal
                isOpen={!!confirm}
                title={confirm?.title || 'Confirmação'}
                message={confirm?.message}
                variant={confirm?.variant}
                confirmLabel={confirm?.confirmLabel}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </AdminPage>
    )
}
