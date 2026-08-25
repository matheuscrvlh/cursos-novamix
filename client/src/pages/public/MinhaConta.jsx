import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, LogOut } from 'lucide-react'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'

import { ClienteAuthContext } from '../../contexts/ClienteAuthContext'
import { getMinhasInscricoes } from '../../api/clientes.services'
import { formatDateTimeBR } from '../../utils/formatDate'
import { bannerHome } from '../../assets/images/banner'

function statusLabel(status) {
    if (status === 'pago') return 'Pago'
    if (status === 'pendente') return 'Aguardando pagamento'
    if (status === 'cancelado') return 'Cancelado'
    if (status === 'recusado') return 'Recusado'
    if (status === 'reembolsado') return 'Reembolsado'
    if (status === 'reembolsando') return 'Reembolso em andamento'
    return status
}

function statusClass(status) {
    if (status === 'pago') return 'bg-green-base'
    if (status === 'pendente') return 'bg-yellow-500'
    if (status === 'reembolsado') return 'bg-red-base'
    return 'bg-gray-base'
}

export default function MinhaConta() {
    const { cliente, loading, logout } = useContext(ClienteAuthContext)
    const navigate = useNavigate()

    const [inscricoes, setInscricoes] = useState([])
    const [carregando, setCarregando] = useState(true)

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

    if (loading || !cliente) return null

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Minha conta | Novamix Cursos' />
            <section className='max-w-180 mx-auto px-5 py-16'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-dark'>Olá, {cliente.nome.split(' ')[0]}</h1>
                        <p className='text-sm text-gray-text/70'>{cliente.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className='flex items-center gap-1.5 text-sm text-gray-text/70 hover:text-red-base transition cursor-pointer'
                    >
                        <LogOut size={16} /> Sair
                    </button>
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
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white shrink-0 ${statusClass(i.status)}`}>
                                    {statusLabel(i.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </PublicLayout>
    )
}
