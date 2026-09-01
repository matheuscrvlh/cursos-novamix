import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, LogOut, Pencil, Lock } from 'lucide-react'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Modal from '../../components/public/Modal'
import Input from '../../components/Input'
import Button from '../../components/Button'

import { ClienteAuthContext } from '../../contexts/ClienteAuthContext'
import { getMinhasInscricoes, alterarSenhaLogado } from '../../api/clientes.services'
import { formatDateTimeBR } from '../../utils/formatDate'
import { statusInscricaoClass } from '../../utils/statusInscricao'

function statusLabel(status) {
    if (status === 'pago') return 'Pago'
    if (status === 'pendente') return 'Aguardando pagamento'
    if (status === 'cancelado') return 'Cancelado'
    if (status === 'recusado') return 'Recusado'
    if (status === 'reembolsado') return 'Reembolsado'
    if (status === 'reembolsando') return 'Reembolso em andamento'
    return status
}

const FORM_VAZIO = { nome: '', celular: '', loja: '' }
const FORM_SENHA_VAZIO = { senhaAtual: '', novaSenha: '', confirmarSenha: '' }

export default function MinhaConta() {
    const { cliente, loading, logout, atualizarPerfil } = useContext(ClienteAuthContext)
    const navigate = useNavigate()

    const [inscricoes, setInscricoes] = useState([])
    const [carregando, setCarregando] = useState(true)

    const [editando, setEditando] = useState(false)
    const [form, setForm] = useState(FORM_VAZIO)
    const [erro, setErro] = useState('')
    const [enviando, setEnviando] = useState(false)

    const [alterandoSenha, setAlterandoSenha] = useState(false)
    const [formSenha, setFormSenha] = useState(FORM_SENHA_VAZIO)
    const [erroSenha, setErroSenha] = useState('')
    const [sucessoSenha, setSucessoSenha] = useState(false)
    const [enviandoSenha, setEnviandoSenha] = useState(false)

    useEffect(() => {
        if (!loading && !cliente) navigate('/entrar')
    }, [loading, cliente, navigate])

    useEffect(() => {
        if (!cliente) return
        getMinhasInscricoes().then(setInscricoes).finally(() => setCarregando(false))
    }, [cliente])

    async function handleLogout() {
        await logout()
        navigate('/')
    }

    function abrirEdicao() {
        setForm({ nome: cliente.nome || '', celular: cliente.celular || '', loja: cliente.loja || '' })
        setErro('')
        setEditando(true)
    }

    async function handleSalvarEdicao(e) {
        e.preventDefault()
        setErro('')

        if (!form.nome.trim()) {
            setErro('Informe seu nome.')
            return
        }

        setEnviando(true)
        const res = await atualizarPerfil(form)
        setEnviando(false)

        if (!res.ok) {
            setErro(res.message || 'Erro ao salvar. Tente novamente.')
            return
        }
        setEditando(false)
    }

    function abrirAlterarSenha() {
        setFormSenha(FORM_SENHA_VAZIO)
        setErroSenha('')
        setSucessoSenha(false)
        setAlterandoSenha(true)
    }

    async function handleSalvarSenha(e) {
        e.preventDefault()
        setErroSenha('')

        if (formSenha.novaSenha.length < 6) {
            setErroSenha('A nova senha precisa ter pelo menos 6 caracteres.')
            return
        }
        if (formSenha.novaSenha !== formSenha.confirmarSenha) {
            setErroSenha('As senhas não coincidem.')
            return
        }

        setEnviandoSenha(true)
        const res = await alterarSenhaLogado(formSenha.senhaAtual, formSenha.novaSenha)
        setEnviandoSenha(false)

        if (!res.ok) {
            setErroSenha(res.message || 'Erro ao alterar senha. Tente novamente.')
            return
        }
        setFormSenha(FORM_SENHA_VAZIO)
        setSucessoSenha(true)
    }

    if (loading || !cliente) return null

    return (
        <PublicLayout showBanner={false}>
            <Head title='Minha conta' />
            <section className='max-w-180 mx-auto px-5 py-16'>
                <div className='flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-dark'>Olá, {cliente.nome.split(' ')[0]}</h1>
                        <p className='text-sm text-gray-text/70'>{cliente.email}</p>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
                        <button
                            onClick={abrirEdicao}
                            className='flex items-center gap-1.5 text-sm text-gray-text/70 hover:text-orange-base transition cursor-pointer'
                        >
                            <Pencil size={16} /> Editar informações
                        </button>
                        <button
                            onClick={abrirAlterarSenha}
                            className='flex items-center gap-1.5 text-sm text-gray-text/70 hover:text-orange-base transition cursor-pointer'
                        >
                            <Lock size={16} /> Alterar senha
                        </button>
                        <button
                            onClick={handleLogout}
                            className='flex items-center gap-1.5 text-sm text-gray-text/70 hover:text-red-base transition cursor-pointer'
                        >
                            <LogOut size={16} /> Sair
                        </button>
                    </div>
                </div>

                <h2 className='font-bold text-gray-dark mb-4'>Minhas inscrições</h2>

                {carregando ? (
                    <p className='text-gray-text/50 text-sm'>Carregando...</p>
                ) : inscricoes.length === 0 ? (
                    <div className='flex flex-col items-center gap-2 py-16 text-gray-text/40'>
                        <Inbox size={36} />
                        <p className='text-sm'>Você ainda não se inscreveu em nenhum curso</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-3'>
                        {inscricoes.map(i => (
                            <div key={i.id} className='bg-white rounded-lg shadow-sm p-4 flex items-center justify-between gap-4'>
                                <div>
                                    <p className='font-semibold text-gray-dark'>{i.nomeCurso}</p>
                                    <p className='text-xs text-gray-text/60 mt-0.5'>
                                        {i.dataCurso && `${i.dataCurso} · `}Assento {i.assento} · Inscrito em {formatDateTimeBR(i.dataInscricao)}
                                    </p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusInscricaoClass(i.status)}`}>
                                    {statusLabel(i.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Modal
                isOpen={editando}
                onClose={() => setEditando(false)}
                width='90%'
                maxWidth='420px'
            >
                <h2 className='text-xl font-bold text-gray-dark mb-1'>Editar informações</h2>
                <p className='text-sm text-gray-text/70 mb-5'>CPF e e-mail não podem ser alterados por aqui.</p>

                <form onSubmit={handleSalvarEdicao} className='flex flex-col gap-3'>
                    <Input
                        placeholder='Nome completo'
                        value={form.nome}
                        onChange={e => setForm({ ...form, nome: e.target.value })}
                        required
                    />
                    <Input
                        placeholder='Celular'
                        value={form.celular}
                        onChange={e => setForm({ ...form, celular: e.target.value })}
                    />
                    <select
                        value={form.loja}
                        onChange={e => setForm({ ...form, loja: e.target.value })}
                        className='p-2.5 border border-gray-base rounded-md text-gray-text bg-white'
                    >
                        <option value=''>Loja de preferência</option>
                        <option value='Prado'>Prado</option>
                        <option value='Teresopolis'>Teresópolis</option>
                    </select>

                    {erro && <p className='text-red-base text-sm'>{erro}</p>}

                    <Button type='submit' className='bg-orange-base hover:bg-orange-light text-white mt-2 disabled:opacity-60' disabled={enviando}>
                        {enviando ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                </form>
            </Modal>

            <Modal
                isOpen={alterandoSenha}
                onClose={() => setAlterandoSenha(false)}
                width='90%'
                maxWidth='420px'
            >
                <h2 className='text-xl font-bold text-gray-dark mb-5'>Alterar senha</h2>

                {sucessoSenha ? (
                    <div className='flex flex-col gap-4'>
                        <p className='text-sm text-gray-text/80'>Senha alterada com sucesso.</p>
                        <Button
                            className='bg-orange-base hover:bg-orange-light text-white'
                            onClick={() => setAlterandoSenha(false)}
                        >
                            Fechar
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSalvarSenha} className='flex flex-col gap-3'>
                        <Input
                            type='password'
                            placeholder='Senha atual'
                            value={formSenha.senhaAtual}
                            onChange={e => setFormSenha({ ...formSenha, senhaAtual: e.target.value })}
                            required
                        />
                        <Input
                            type='password'
                            placeholder='Nova senha (mínimo 6 caracteres)'
                            value={formSenha.novaSenha}
                            onChange={e => setFormSenha({ ...formSenha, novaSenha: e.target.value })}
                            required
                        />
                        <Input
                            type='password'
                            placeholder='Confirmar nova senha'
                            value={formSenha.confirmarSenha}
                            onChange={e => setFormSenha({ ...formSenha, confirmarSenha: e.target.value })}
                            required
                        />

                        {erroSenha && <p className='text-red-base text-sm'>{erroSenha}</p>}

                        <Button type='submit' className='bg-orange-base hover:bg-orange-light text-white mt-2 disabled:opacity-60' disabled={enviandoSenha}>
                            {enviandoSenha ? 'Salvando...' : 'Alterar senha'}
                        </Button>
                    </form>
                )}
            </Modal>
        </PublicLayout>
    )
}
