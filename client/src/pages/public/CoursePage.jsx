import { useState, useEffect, useRef, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ArrowLeft, XCircle, Loader2, Printer, ChefHat, ShieldCheck, RotateCcw, MessageCircle } from 'lucide-react'

import PublicLayout from '../../layouts/public/PublicLayout'
import { ClienteAuthContext } from '../../contexts/ClienteAuthContext'
import { Head } from '../../components/Head'
import Button from '../../components/Button'
import ModalLoginRequired from '../../components/public/enrollment/ModalLoginRequired'
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats'
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess'
import ModalEnrollmentPayment from '../../components/public/enrollment/ModalEnrollmentPayment'

import { getCourseById } from '../../api/courses.services'
import { postEnrollment, putSeatChange, getSeats, cancelEnrollment } from '../../api/enrollment.services'
import { formatarPreco } from '../../utils/formatCurrency'
import { cursoEncerrado, partesData, formatHora } from '../../utils/formatDate'
import { LOJAS, nomeLoja } from '../../utils/lojas'

export default function CoursePage() {
    const { id } = useParams()
    const { cliente } = useContext(ClienteAuthContext)

    const [curso, setCurso]               = useState(null)
    const [loading, setLoading]           = useState(true)
    const [assentos, setAssentos]         = useState([])
    const [vagasLivres, setVagasLivres]   = useState(0)
    const [fotoIdx, setFotoIdx]           = useState(0)
    const [step, setStep]                 = useState(null)
    const [inscricaoAtiva, setInscricaoAtiva]     = useState(null)
    const [assentoAtual, setAssentoAtual]         = useState(null)
    const [payerEmail, setPayerEmail]             = useState(null)
    const [loadingPagamento, setLoadingPagamento] = useState(false)
    const [erroPagamento, setErroPagamento]       = useState(null)
    const [pagamentoAprovado, setPagamentoAprovado] = useState(true)
    const [form, setForm]                 = useState({
        cursoId: id,
        nome: '',
        cpf: '',
        celular: '',
        email: '',
        assento: '',
    })

    useEffect(() => {
        getCourseById(id)
            .then(data => { if (data && !data.message) setCurso(data) })
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        if (!id) return
        getSeats(id).then(data => {
            if (Array.isArray(data)) {
                setAssentos(data)
                setVagasLivres(data.filter(a => a.status === 'livre').length)
            }
        })
    }, [id])

    // refaz a busca de assentos toda vez que a tela de seleção abre — sem
    // isso, quem demora no formulário (ou tenta de novo depois de um erro)
    // via o mesmo `assentos` buscado só uma vez no mount, podendo escolher
    // repetidamente um assento que outra pessoa já ocupou nesse meio-tempo
    useEffect(() => {
        if (step !== 'assento' || !id) return
        getSeats(id).then(data => {
            if (Array.isArray(data)) {
                setAssentos(data)
                setVagasLivres(data.filter(a => a.status === 'livre').length)
            }
        })
    }, [step, id])

    // Mantém a inscrição ativa acessível fora do ciclo de render, pra liberar
    // o assento mesmo quando o cliente sai sem passar pelo botão de fechar
    // (fecha a aba, dá refresh ou navega pra outra rota do site)
    const inscricaoAtivaRef = useRef(null)
    useEffect(() => { inscricaoAtivaRef.current = inscricaoAtiva }, [inscricaoAtiva])

    useEffect(() => {
        function cancelarInscricaoAtiva() {
            if (inscricaoAtivaRef.current) {
                navigator.sendBeacon(`/api/inscricoes/${inscricaoAtivaRef.current}/cancelar`)
            }
        }

        window.addEventListener('pagehide', cancelarInscricaoAtiva)
        return () => {
            window.removeEventListener('pagehide', cancelarInscricaoAtiva)
            cancelarInscricaoAtiva()
        }
    }, [])

    async function handleSubmit() {
        const assentoId = form.assento

        setStep(null)
        setLoadingPagamento(true)
        setErroPagamento(null)

        try {
            // já existe inscrição ativa: está só trocando de assento, não criando outra
            if (inscricaoAtiva) {
                const resultado = await putSeatChange(inscricaoAtiva, assentoId);
                if (!resultado?.ok) {
                    setErroPagamento(resultado?.message || 'Não foi possível trocar de assento. Tente novamente.');
                    setStep('assento');
                    return;
                }

                setAssentos(prev => prev.map(a => {
                    if (a.id === assentoAtual) return { ...a, status: 'livre' }
                    if (a.id === Number(assentoId)) return { ...a, status: 'reservado' }
                    return a
                }))
                setAssentoAtual(Number(assentoId))
                setStep('pagamento')
                return
            }

            const inscricao = await postEnrollment({
                cursoId: form.cursoId,
                nome: form.nome,
                cpf: form.cpf,
                celular: form.celular,
                email: form.email,
                assento: assentoId,
            })

            if (!inscricao || inscricao.message) {
                setErroPagamento(inscricao?.message || 'Erro ao criar inscrição. Tente novamente.')
                return
            }

            setPayerEmail(form.email)
            setForm(prev => ({ ...prev, nome: '', cpf: '', celular: '', email: '' }))

            setAssentoAtual(Number(assentoId))
            setInscricaoAtiva(inscricao.id)
            setStep('pagamento')

            setAssentos(prev => prev.map(a =>
                a.id === Number(assentoId) ? { ...a, status: 'reservado' } : a
            ))
            setVagasLivres(prev => Math.max(prev - 1, 0))
        } catch {
            setErroPagamento('Ocorreu um erro inesperado. Tente novamente.')
        } finally {
            setLoadingPagamento(false)
        }
    }

    // Volta pra tela de assentos sem cancelar a inscrição já criada
    async function handleTrocarAssento() {
        try {
            const dados = await getSeats(id)
            if (Array.isArray(dados)) setAssentos(dados)
        } catch (err) {
            console.error(err)
        }
        setStep('assento')
    }

    function resetForm() {
        setForm({ cursoId: id, nome: '', cpf: '', celular: '', email: '', assento: '' })
    }

    // sem conta, não dá pra saber os dados de quem tá se inscrevendo — manda
    // pro login/cadastro em vez de pedir os dados manualmente aqui
    function abrirInscricao() {
        if (!cliente) {
            setStep('loginRequired')
            return
        }
        setForm(prev => ({
            ...prev,
            nome: cliente.nome || '',
            cpf: cliente.cpf || '',
            celular: cliente.celular || '',
            email: cliente.email || '',
        }))
        setStep('assento')
    }

    // Abre uma aba só com a lista de ingredientes e já chama o print — o
    // cliente não precisa imprimir a página inteira do curso
    function imprimirIngredientes() {
        const escapeHtml = texto => texto.replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        }[c]))

        const itens = curso.ingredientes.split('\n').filter(i => i.trim()).map(escapeHtml)
        const nomeCurso = escapeHtml(curso.nomeCurso || '')
        const janela = window.open('', '_blank')
        if (!janela) return

        janela.document.write(`
            <html>
                <head>
                    <title>Ingredientes — ${nomeCurso}</title>
                    <style>
                        body { font-family: sans-serif; padding: 32px; color: #1f2937; }
                        h1 { font-size: 20px; margin-bottom: 4px; }
                        p { color: #6b7280; font-size: 13px; margin-top: 0; margin-bottom: 24px; }
                        ul { padding-left: 20px; }
                        li { font-size: 15px; margin-bottom: 8px; }
                    </style>
                </head>
                <body>
                    <h1>${nomeCurso}</h1>
                    <p>Lista de ingredientes</p>
                    <ul>${itens.map(item => `<li>${item}</li>`).join('')}</ul>
                </body>
            </html>
        `)
        janela.document.close()
        janela.focus()
        janela.print()
    }

    // Fecha o modal e, se havia uma inscrição pendente em aberto (cliente
    // desistiu no meio do pagamento), cancela ela e libera o assento na hora
    async function closeModal() {
        if (inscricaoAtiva) {
            try { await cancelEnrollment(inscricaoAtiva) } catch (err) { console.error(err) }
        }
        setStep(null)
        setInscricaoAtiva(null)
        setAssentoAtual(null)
        setPayerEmail(null)
        resetForm()
    }

    if (loading) {
        return (
            <PublicLayout showBanner={false}>
                <div className='flex items-center justify-center min-h-96'>
                    <Loader2 size='2rem' className='text-orange-base animate-spin' />
                </div>
            </PublicLayout>
        )
    }

    if (!curso) {
        return (
            <PublicLayout showBanner={false}>
                <div className='flex flex-col items-center justify-center min-h-96 gap-4 px-5 text-center'>
                    <p className='text-gray-text/60 text-lg'>Curso não encontrado.</p>
                    <Link to='/cursos'>
                        <Button className='bg-orange-base text-white hover:bg-orange-light'>
                            Ver todos os cursos
                        </Button>
                    </Link>
                </div>
            </PublicLayout>
        )
    }

    const fotos = Array.isArray(curso.fotos) ? curso.fotos : []
    const imagemAtual = fotos[fotoIdx] || null
    const encerrado = cursoEncerrado(curso)
    const totalAssentos = assentos.length
    // só conta como esgotado depois que os assentos carregaram — antes disso
    // vagasLivres ainda é 0 e o botão piscava "Vagas esgotadas"
    const esgotado = totalAssentos > 0 && vagasLivres === 0
    const bloqueado = encerrado || esgotado
    const percentualOcupado = totalAssentos ? Math.round(((totalAssentos - vagasLivres) / totalAssentos) * 100) : 0
    const ultimasVagas = !esgotado && totalAssentos > 0 && vagasLivres <= Math.max(3, Math.ceil(totalAssentos * 0.2))

    const { dia, mes, semana, extenso } = partesData(curso.data)
    const preco = Number(curso.valor) === 0 ? 'Grátis' : `R$ ${formatarPreco(curso.valor)}`
    const textoBotao = encerrado ? 'Curso encerrado' : esgotado ? 'Vagas esgotadas' : 'Garantir minha vaga'
    const loja = LOJAS[curso.loja]

    return (
        <PublicLayout showBanner={false} bottomBar>
            <Head
                title={curso.nomeCurso}
                description={`Curso ${curso.nomeCurso}${curso.culinarista ? ` com ${curso.culinarista}` : ''}${curso.loja ? ` na loja ${nomeLoja(curso.loja)}` : ''}.`}
            />

            <div className='max-w-7xl mx-auto px-5 md:px-8 pt-6 pb-10 md:pt-8 lg:pb-16'>

                <Link
                    to='/cursos'
                    className='inline-flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-cocoa hover:text-orange-base transition-colors duration-500 mb-6'
                >
                    <ArrowLeft size='0.875rem' strokeWidth={1.5} />
                    Voltar para a agenda
                </Link>

                {/* no lg o quadro de inscrição vai pra coluna da direita e fica
                    fixo na rolagem; no celular ele vem logo depois da arte */}
                <div className='grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10'>

                    <div className='lg:col-start-1 flex flex-col gap-3 min-w-0'>
                        <div className='relative w-full aspect-4/5 sm:aspect-4/3 rounded-xl overflow-hidden bg-chocolate'>
                            {imagemAtual ? (
                                <>
                                    {/* a arte é 4:5 e o quadro é mais largo a partir do sm —
                                        a própria arte desfocada preenche as laterais, sem recortar nada */}
                                    <img src={imagemAtual} alt='' aria-hidden='true' className='absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60' />
                                    <img src={imagemAtual} alt={curso.nomeCurso} className='relative w-full h-full object-contain' />
                                </>
                            ) : (
                                <div className='w-full h-full flex items-center justify-center'>
                                    <ChefHat size='4rem' strokeWidth={1.25} className='text-cream/20' />
                                </div>
                            )}
                        </div>

                        {fotos.length > 1 && (
                            <div className='flex gap-2 overflow-x-auto pb-1'>
                                {fotos.map((foto, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setFotoIdx(i)}
                                        aria-label={`Foto ${i + 1}`}
                                        className={`w-16 h-20 shrink-0 rounded-lg overflow-hidden ring-1 ring-offset-2 ring-offset-cream transition duration-500 cursor-pointer ${i === fotoIdx ? 'ring-gold' : 'ring-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={foto} alt='' className='w-full h-full object-cover' />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className='lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-24 bg-white rounded-xl ring-1 ring-chocolate/[0.07] shadow-[0_30px_60px_-40px_rgba(58,42,33,0.45)] p-6 md:p-8 flex flex-col gap-6'>

                        <div>
                            {curso.categoria && (
                                <p className='text-[0.625rem] font-medium uppercase tracking-[0.28em] text-gold mb-2'>{curso.categoria}</p>
                            )}
                            <h1 className='font-serif text-[2.125rem] md:text-[2.625rem] font-bold text-chocolate leading-[1.02]'>
                                {curso.nomeCurso}
                            </h1>
                            {curso.culinarista && (
                                <p className='flex items-center gap-1.5 text-sm font-normal text-cocoa mt-3'>
                                    <ChefHat size='0.9375rem' strokeWidth={1.5} className='text-gold shrink-0' />
                                    com <span className='font-serif italic text-lg font-semibold text-chocolate'>{curso.culinarista}</span>
                                </p>
                            )}
                        </div>

                        <ul className='flex flex-col gap-3.5'>
                            <InfoItem icon={<Calendar size='1rem' strokeWidth={1.5} className='text-gold' />} label='Data'>
                                {extenso}
                            </InfoItem>
                            <InfoItem icon={<Clock size='1rem' strokeWidth={1.5} className='text-gold' />} label='Horário'>
                                {formatHora(curso.hora)}{curso.duracao ? ` · ${curso.duracao} de duração` : ''}
                            </InfoItem>
                            {curso.loja && (
                                <InfoItem icon={<MapPin size='1rem' strokeWidth={1.5} className='text-gold' />} label='Local'>
                                    Loja {nomeLoja(curso.loja)}
                                    {loja && <span className='block text-xs font-normal text-cocoa mt-0.5'>{loja.endereco}</span>}
                                </InfoItem>
                            )}
                        </ul>

                        <div className='border-t border-chocolate/[0.08] pt-6 flex flex-col gap-5'>
                            <div className='flex items-end justify-between gap-3'>
                                <div className='leading-tight'>
                                    <p className='text-[0.625rem] font-medium uppercase tracking-[0.22em] text-cocoa mb-1.5'>Investimento</p>
                                    <p className='font-serif italic text-[2.625rem] font-bold text-orange-base leading-none'>{preco}</p>
                                </div>
                                {totalAssentos > 0 && !encerrado && (
                                    <p className={`text-sm text-right font-normal ${esgotado || ultimasVagas ? 'text-orange-base font-medium' : 'text-cocoa'}`}>
                                        {esgotado ? 'Esgotado' : <><span className='font-serif text-xl font-bold text-chocolate'>{vagasLivres}</span> de {totalAssentos} vagas livres</>}
                                    </p>
                                )}
                            </div>

                            {totalAssentos > 0 && !encerrado && (
                                <div className='w-full h-0.5 bg-chocolate/[0.08] rounded-full overflow-hidden'>
                                    <div
                                        className='h-full rounded-full bg-orange-base transition-all duration-1000 ease-luxo'
                                        style={{ width: `${percentualOcupado}%` }}
                                    />
                                </div>
                            )}

                            <button
                                onClick={abrirInscricao}
                                disabled={bloqueado}
                                className={`w-full py-4 rounded-full text-xs font-medium uppercase tracking-[0.22em] transition-colors duration-500 ${
                                    bloqueado
                                        ? 'bg-cream-dark text-cocoa/60 cursor-not-allowed'
                                        : 'bg-orange-base text-white hover:bg-chocolate cursor-pointer'
                                }`}
                            >
                                {textoBotao}
                            </button>

                            <div className='flex flex-col gap-2.5 text-xs font-normal text-cocoa'>
                                <p className='flex items-center gap-2'>
                                    <ShieldCheck size='0.9375rem' strokeWidth={1.5} className='text-gold shrink-0' />
                                    Pagamento seguro pelo Mercado Pago, no Pix ou cartão
                                </p>
                                <p className='flex items-center gap-2'>
                                    <RotateCcw size='0.9375rem' strokeWidth={1.5} className='text-gold shrink-0' />
                                    Reembolso somente antes de 24h do início do curso
                                </p>
                            </div>
                        </div>

                        <a
                            href='https://api.whatsapp.com/send?phone=5522998336225'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center justify-center gap-2 py-3.5 rounded-full border border-chocolate/15 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-chocolate hover:bg-chocolate hover:text-cream hover:border-chocolate transition-colors duration-500'
                        >
                            <MessageCircle size='0.9375rem' strokeWidth={1.5} />
                            Dúvidas? Fale com a gente
                        </a>
                    </aside>

                    {curso.ingredientes && curso.ingredientes.trim() && (
                        <div className='lg:col-start-1 bg-white rounded-xl ring-1 ring-chocolate/[0.07] p-6 md:p-8'>
                            <div className='flex items-center justify-between mb-5'>
                                <h2 className='font-serif text-[1.75rem] font-semibold text-chocolate leading-none'>Ingredientes</h2>
                                <button
                                    onClick={imprimirIngredientes}
                                    className='flex items-center gap-1.5 text-orange-base hover:text-chocolate text-[0.625rem] uppercase tracking-[0.18em] font-medium transition-colors duration-500 cursor-pointer'
                                >
                                    <Printer size='0.875rem' strokeWidth={1.5} />
                                    Imprimir
                                </button>
                            </div>
                            <ul className='grid gap-x-8 gap-y-2.5 sm:grid-cols-2'>
                                {curso.ingredientes.split('\n').filter(i => i.trim()).map((item, idx) => (
                                    <li key={idx} className='flex items-start gap-3 text-[0.9375rem] font-normal text-chocolate'>
                                        <span className='mt-2 w-1.5 h-1.5 rotate-45 bg-gold shrink-0' />
                                        {item.trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {assentos.length > 0 && !encerrado && (
                        <div className='lg:col-start-1 bg-white rounded-xl ring-1 ring-chocolate/[0.07] p-6 md:p-8'>
                            <h2 className='font-serif text-[1.75rem] font-semibold text-chocolate leading-none mb-5'>Mapa de assentos</h2>

                            <div className='bg-chocolate rounded-lg py-3 text-center text-[0.6875rem] font-medium text-cream uppercase tracking-[0.35em] mb-5'>
                                Balcão
                            </div>

                            <div className='grid grid-cols-6 sm:grid-cols-8 gap-3 mb-4'>
                                {assentos.map(assento => {
                                    const ocupado = assento.status !== 'livre'
                                    return (
                                        <div key={assento.id} className='flex flex-col items-center'>
                                            <div className={`w-3/5 h-3 rounded-t-md ${ocupado ? 'bg-gray-base/25' : 'bg-orange-base'}`} />
                                            <div className={`w-full h-8 rounded-b-lg flex items-center justify-center font-bold text-xs ${
                                                ocupado ? 'bg-gray-base/20 text-gray-base/40' : 'bg-orange-base text-white'
                                            }`}>
                                                {assento.id}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className='flex flex-wrap justify-center gap-x-5 gap-y-1.5'>
                                <div className='flex items-center gap-1.5 text-xs text-gray-text/60'>
                                    <span className='w-3 h-3 rounded-sm bg-orange-base' />
                                    Disponível
                                </div>
                                <div className='flex items-center gap-1.5 text-xs text-gray-text/60'>
                                    <span className='w-3 h-3 rounded-sm bg-gray-base/20' />
                                    Ocupado
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* barra fixa no celular: o quadro de inscrição fica pra trás quando o
                cliente rola pra ver ingredientes/assentos, e o botão continua à mão */}
            <div className='lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur border-t border-chocolate/10 px-5 py-3 flex items-center justify-between gap-4 shadow-[0_-10px_30px_-12px_rgba(58,42,33,0.25)]'>
                <div className='leading-tight min-w-0'>
                    <p className='font-serif italic text-[1.625rem] font-bold text-orange-base leading-none'>{preco}</p>
                    <p className='text-[0.6875rem] font-normal text-cocoa truncate mt-1'>
                        <span className='capitalize'>{semana}</span>, {dia} {mes} · {formatHora(curso.hora)}
                    </p>
                </div>
                <button
                    onClick={abrirInscricao}
                    disabled={bloqueado}
                    className={`shrink-0 px-6 py-3.5 rounded-full text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors duration-500 ${
                        bloqueado
                            ? 'bg-cream-dark text-cocoa/60 cursor-not-allowed'
                            : 'bg-orange-base text-white hover:bg-chocolate cursor-pointer'
                    }`}
                >
                    {bloqueado ? textoBotao : 'Garantir vaga'}
                </button>
            </div>

            {loadingPagamento && (
                <div className='flex items-center justify-center fixed inset-0 bg-chocolate/55 backdrop-blur-sm z-50 animate-pagina'>
                    <div className='bg-white rounded-2xl p-10 flex flex-col items-center gap-5 shadow-2xl animate-surgir'>
                        <Loader2 size='2.5rem' className='text-orange-base animate-spin' />
                        <p className='font-serif italic text-2xl font-semibold text-chocolate'>Preparando pagamento...</p>
                    </div>
                </div>
            )}

            {erroPagamento && (
                <div
                    className='flex items-center justify-center fixed inset-0 bg-chocolate/55 backdrop-blur-sm z-50 p-4 animate-pagina'
                    onClick={() => setErroPagamento(null)}
                >
                    <div
                        className='bg-white rounded-2xl p-10 flex flex-col items-center gap-5 max-w-sm w-full shadow-2xl animate-surgir'
                        onClick={e => e.stopPropagation()}
                    >
                        <XCircle size='3rem' className='text-red-base' />
                        <p className='text-chocolate text-center'>{erroPagamento}</p>
                        <Button
                            className='bg-orange-base text-white hover:bg-orange-light w-full'
                            onClick={() => { setErroPagamento(null); setStep('assento') }}
                        >
                            Tentar novamente
                        </Button>
                    </div>
                </div>
            )}

            <ModalLoginRequired
                isOpen={step === 'loginRequired'}
                onClose={closeModal}
            />

            <ModalEnrollmentSeats
                isOpen={step === 'assento'}
                onClick={handleSubmit}
                onClose={closeModal}
                enrollment={form}
                setEnrollment={setForm}
                assentos={assentos}
                assentoAtual={assentoAtual}
            />

            <ModalEnrollmentPayment
                isOpen={step === 'pagamento'}
                inscricaoId={inscricaoAtiva}
                valor={curso?.valor}
                payerEmail={payerEmail}
                onTrocarAssento={handleTrocarAssento}
                onSuccess={(status) => {
                    setPagamentoAprovado(status === 'approved')
                    setStep('confirmacao')
                }}
                onClose={closeModal}
            />

            <ModalEnrollmentSucess
                isOpen={step === 'confirmacao'}
                pago={pagamentoAprovado}
                onClick={closeModal}
                onClose={closeModal}
            />
        </PublicLayout>
    )
}

function InfoItem({ icon, label, children }) {
    return (
        <li className='flex items-start gap-3'>
            <span className='w-10 h-10 rounded-full ring-1 ring-gold/40 flex items-center justify-center shrink-0'>
                {icon}
            </span>
            <div className='min-w-0'>
                <p className='text-[0.625rem] font-medium text-cocoa uppercase tracking-[0.25em] mb-0.5'>{label}</p>
                <p className='text-[0.9375rem] text-chocolate'>{children}</p>
            </div>
        </li>
    )
}
