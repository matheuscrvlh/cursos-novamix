import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Button from '../../components/Button'

const configs = {
    aprovado: {
        icon: <CheckCircle2 size={64} className='text-green-500' />,
        titulo: 'Pagamento aprovado!',
        mensagem: 'Sua inscrição foi confirmada. Entraremos em contato para mais detalhes sobre o curso.',
        cor: 'text-green-600',
        bg: 'bg-green-50',
    },
    recusado: {
        icon: <XCircle size={64} className='text-red-500' />,
        titulo: 'Pagamento recusado',
        mensagem: 'Não foi possível processar seu pagamento. Tente novamente ou escolha outra forma de pagamento.',
        cor: 'text-red-600',
        bg: 'bg-red-50',
    },
    pendente: {
        icon: <Clock size={64} className='text-yellow-500' />,
        titulo: 'Pagamento em análise',
        mensagem: 'Seu pagamento está sendo processado. Assim que for confirmado, você receberá uma notificação.',
        cor: 'text-yellow-600',
        bg: 'bg-yellow-50',
    },
}

export default function PaymentResult({ status }) {
    const [searchParams] = useSearchParams()
    const mpStatus       = searchParams.get('status')
    const inscricaoId    = searchParams.get('external_reference')
    const paymentId      = searchParams.get('collection_id') || searchParams.get('payment_id')

    const [statusReal, setStatusReal] = useState(null)
    const [verificando, setVerificando] = useState(false)

    useEffect(() => {
        if (!inscricaoId) return
        setVerificando(true)
        fetch(`/api/pagamentos/status/${inscricaoId}`)
            .then(r => r.json())
            .then(data => { if (data?.status) setStatusReal(data.status) })
            .catch(() => {})
            .finally(() => setVerificando(false))
    }, [inscricaoId])

    function resolverTipo() {
        if (status) return status
        const s = statusReal || mpStatus
        if (s === 'approved' || s === 'pago')    return 'aprovado'
        if (s === 'pending'  || s === 'pendente') return 'pendente'
        return 'recusado'
    }

    const tipo   = resolverTipo()
    const config = configs[tipo] || configs.recusado

    return (
        <PublicLayout>
            <Head title='Resultado do Pagamento | Novamix Cursos' />
            <div className='flex flex-col items-center justify-center min-h-96 px-4 py-16 text-center gap-6'>

                {verificando ? (
                    <Loader2 size={48} className='text-orange-base animate-spin' />
                ) : (
                    <>
                        {config.icon}

                        <div className={`rounded-2xl px-8 py-6 max-w-md w-full ${config.bg}`}>
                            <h1 className={`text-2xl font-bold ${config.cor} mb-2`}>{config.titulo}</h1>
                            <p className='text-gray-text/70'>{config.mensagem}</p>

                            {paymentId && (
                                <p className='text-xs text-gray-text/40 mt-4'>
                                    ID do pagamento: <span className='font-mono'>{paymentId}</span>
                                </p>
                            )}
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3'>
                            <Link to='/cursos'>
                                <Button className='bg-orange-base text-white hover:bg-orange-light px-6 py-2.5'>
                                    Ver todos os cursos
                                </Button>
                            </Link>
                            {tipo === 'recusado' && (
                                <Button
                                    className='bg-white border border-gray-base text-gray-text hover:bg-gray px-6 py-2.5'
                                    onClick={() => window.history.back()}
                                >
                                    Tentar novamente
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    )
}
