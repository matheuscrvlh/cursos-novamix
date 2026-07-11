import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Loader2, Copy, Check, AlertCircle, ArrowLeft } from 'lucide-react'

export default function ModalEnrollmentPayment({ isOpen, inscricaoId, valor, payerEmail, onSuccess, onClose }) {
    const brickRef = useRef(null)
    const pollRef = useRef(null)
    const [pixInfo, setPixInfo] = useState(null)
    const [copied, setCopied] = useState(false)
    const [erro, setErro] = useState(null)

    const montarBrick = useCallback(() => {
        if (!window.MercadoPago) return

        if (brickRef.current) {
            brickRef.current.unmount()
            brickRef.current = null
        }

        const PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY
        const mp = new window.MercadoPago(PUBLIC_KEY, { locale: 'pt-BR' })

        mp.bricks().create('payment', 'mp-card-brick-container', {
            initialization: {
                amount: Number(valor),
                payer: payerEmail ? { email: payerEmail } : undefined,
            },
            customization: {
                visual: { style: { theme: 'default' } },
                paymentMethods: {
                    creditCard: 'all',
                    debitCard: 'all',
                    bankTransfer: 'all',
                    maxInstallments: 1,
                },
            },
            callbacks: {
                onReady: () => {},
                onSubmit: ({ formData }) => {
                    setErro(null)
                    return new Promise((resolve, reject) => {
                        fetch('/api/pagamentos/processar-pagamento', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ inscricaoId, ...formData, payer: { email: formData.payer?.email || payerEmail } }),
                        })
                            .then(r => r.json())
                            .then(data => {
                                if (data.status === 'approved') {
                                    resolve()
                                    onSuccess('approved')
                                } else if (formData.payment_method_id === 'pix' && data.status === 'pending') {
                                    resolve()
                                    if (brickRef.current) {
                                        brickRef.current.unmount()
                                        brickRef.current = null
                                    }
                                    setPixInfo({ qrCode: data.qr_code, qrCodeBase64: data.qr_code_base64 })
                                } else if (data.status === 'pending' || data.status === 'in_process') {
                                    resolve()
                                    onSuccess(data.status)
                                } else {
                                    const mensagem = data.message || 'Pagamento não aprovado. Verifique os dados e tente novamente.'
                                    setErro(mensagem)
                                    reject(new Error(mensagem))
                                }
                            })
                            .catch(err => {
                                setErro('Não foi possível conectar ao servidor de pagamento. Tente novamente.')
                                reject(err)
                            })
                    })
                },
                onError: (err) => {
                    console.error('[MP Brick]', err)
                },
            },
        }).then(brick => {
            brickRef.current = brick
        })
    }, [inscricaoId, valor, payerEmail, onSuccess])

    useEffect(() => {
        if (!isOpen || !inscricaoId || !valor) return

        if (window.MercadoPago) {
            montarBrick()
        } else {
            const existing = document.getElementById('mp-sdk-script')
            if (!existing) {
                const script = document.createElement('script')
                script.id = 'mp-sdk-script'
                script.src = 'https://sdk.mercadopago.com/js/v2'
                script.onload = montarBrick
                document.body.appendChild(script)
            } else {
                existing.addEventListener('load', montarBrick)
            }
        }

        return () => {
            if (brickRef.current) {
                brickRef.current.unmount()
                brickRef.current = null
            }
            setPixInfo(null)
            setCopied(false)
            setErro(null)
        }
    }, [isOpen, inscricaoId, valor, montarBrick])

    // Poll pelo status da inscricao enquanto o QR do Pix estiver visivel
    useEffect(() => {
        if (!pixInfo || !inscricaoId) return

        pollRef.current = setInterval(() => {
            fetch(`/api/pagamentos/status/${inscricaoId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'pago') {
                        clearInterval(pollRef.current)
                        onSuccess('approved')
                    }
                })
                .catch(() => {})
        }, 4000)

        return () => clearInterval(pollRef.current)
    }, [pixInfo, inscricaoId, onSuccess])

    function copiarCodigo() {
        if (!pixInfo?.qrCode) return
        navigator.clipboard.writeText(pixInfo.qrCode).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    // Volta da tela do QR pra seleção de forma de pagamento, sem fechar o modal
    function trocarFormaPagamento() {
        setPixInfo(null)
        setErro(null)
        montarBrick()
    }

    if (!isOpen) return null

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-xl rounded-xl w-[90%] max-w-lg max-h-[90vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex items-center justify-between p-5 pb-4 border-b border-gray-base/20'>
                    <div>
                        <h2 className='font-bold text-gray-dark text-lg'>Pagamento</h2>
                        <p className='text-xs text-gray-text/60 mt-0.5'>Seus dados são protegidos pelo MercadoPago</p>
                    </div>
                    <button
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray text-gray-text/60 hover:text-gray-dark transition cursor-pointer'
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className='p-5'>
                    {pixInfo && (
                        <button
                            onClick={trocarFormaPagamento}
                            className='flex items-center gap-1.5 text-gray-text/60 hover:text-gray-dark text-xs font-medium mb-4 cursor-pointer'
                        >
                            <ArrowLeft size={14} />
                            Trocar forma de pagamento
                        </button>
                    )}
                    {erro && (
                        <div className='flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4'>
                            <AlertCircle size={16} className='shrink-0 mt-0.5' />
                            <p>{erro}</p>
                        </div>
                    )}
                    {pixInfo ? (
                        <div className='flex flex-col items-center gap-4 text-center'>
                            {pixInfo.qrCodeBase64 && (
                                <img
                                    src={`data:image/png;base64,${pixInfo.qrCodeBase64}`}
                                    alt='QR Code Pix'
                                    className='w-56 h-56 rounded-lg border border-gray-base/20'
                                />
                            )}
                            <p className='text-sm text-gray-text/70'>
                                Escaneie o QR Code no app do seu banco ou copie o código abaixo.
                            </p>
                            <button
                                onClick={copiarCodigo}
                                className='flex items-center gap-2 bg-gray-dark/5 hover:bg-gray-dark/10 text-gray-dark text-sm font-medium px-4 py-2.5 rounded-lg transition w-full justify-center cursor-pointer'
                            >
                                {copied ? <Check size={16} className='text-green-base' /> : <Copy size={16} />}
                                {copied ? 'Código copiado!' : 'Copiar código Pix'}
                            </button>
                            <div className='flex items-center gap-2 text-xs text-gray-text/60 mt-2'>
                                <Loader2 size={14} className='animate-spin' />
                                Aguardando confirmação do pagamento...
                            </div>
                        </div>
                    ) : (
                        <div id='mp-card-brick-container' />
                    )}
                </div>
            </div>
        </div>
    )
}
