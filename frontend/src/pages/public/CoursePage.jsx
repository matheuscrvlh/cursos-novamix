import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, User, MapPin, Tag, ArrowLeft } from 'lucide-react'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Button from '../../components/Button'
import ModalEnrollmentForm from '../../components/public/enrollment/ModalEnrollmentForm'
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats'
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess'

import { getCourseById } from '../../api/courses.services'
import { postEnrollment, getSeats } from '../../api/enrollment.services'

async function criarPreferencia(inscricaoId) {
    const res = await fetch('/api/pagamentos/criar-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscricaoId }),
    })
    return res.json()
}

function formatDate(dateStr) {
    if (!dateStr) return ''
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano}`
}

export default function CoursePage() {
    const { id } = useParams()

    const [curso, setCurso]               = useState(null)
    const [loading, setLoading]           = useState(true)
    const [assentos, setAssentos]         = useState([])
    const [vagasLivres, setVagasLivres]   = useState(0)
    const [fotoIdx, setFotoIdx]           = useState(0)
    const [step, setStep]                 = useState(null)
    const [form, setForm]                 = useState({
        cursoId: id,
        nome: '',
        cpf: '',
        celular: '',
        formaPagamento: 'mercadopago',
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

    async function handleSubmit() {
        const inscricao = await postEnrollment({
            cursoId: form.cursoId,
            nome: form.nome,
            cpf: form.cpf,
            celular: form.celular,
            formaPagamento: form.formaPagamento,
            assento: form.assento,
        })

        if (!inscricao || inscricao.message) {
            alert(inscricao?.message || 'Erro ao criar inscrição')
            return
        }

        const formaPagamento = form.formaPagamento
        resetForm()

        if (formaPagamento === 'mercadopago') {
            const { checkout_url } = await criarPreferencia(inscricao.id)
            if (checkout_url) {
                window.location.href = checkout_url
            } else {
                alert('Erro ao gerar link de pagamento. Tente novamente.')
            }
        } else {
            setStep('confirmacao')
        }

        setAssentos(prev => prev.map(a =>
            a.id === Number(form.assento) ? { ...a, status: 'reservado' } : a
        ))
        setVagasLivres(prev => Math.max(prev - 1, 0))
    }

    function resetForm() {
        setForm({ cursoId: id, nome: '', cpf: '', celular: '', formaPagamento: 'mercadopago', assento: '' })
    }

    function closeModal() {
        setStep(null)
        resetForm()
    }

    if (loading) {
        return (
            <PublicLayout>
                <div className='flex items-center justify-center min-h-96'>
                    <p className='text-gray-text/60 text-lg'>Carregando...</p>
                </div>
            </PublicLayout>
        )
    }

    if (!curso) {
        return (
            <PublicLayout>
                <div className='flex flex-col items-center justify-center min-h-96 gap-4'>
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

    return (
        <PublicLayout>
            <Head title={`${curso.nomeCurso} | Novamix Cursos`} />

            <div className='max-w-4xl mx-auto px-4 py-8 md:px-8'>

                {/* Voltar */}
                <Link
                    to='/cursos'
                    className='inline-flex items-center gap-1.5 text-sm text-gray-text/60 hover:text-orange-base transition mb-6'
                >
                    <ArrowLeft size={15} />
                    Voltar para cursos
                </Link>

                {/* Imagem principal */}
                <div className='relative w-full rounded-2xl overflow-hidden bg-gray-base/10 aspect-video mb-8'>
                    {imagemAtual ? (
                        <img src={imagemAtual} alt={curso.nomeCurso} className='w-full h-full object-cover' />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                            <User size={64} className='text-gray-base/20' />
                        </div>
                    )}

                    <span className='absolute bottom-4 left-4 bg-orange-base text-white text-base font-bold px-4 py-1.5 rounded-full shadow-lg'>
                        R$ {curso.valor}
                    </span>
                    {curso.loja && (
                        <span className={`absolute top-4 right-4 text-white text-sm font-semibold px-3 py-1 rounded-full ${curso.loja === 'Prado' ? 'bg-orange-base' : 'bg-blue-base'}`}>
                            {curso.loja}
                        </span>
                    )}

                    {fotos.length > 1 && (
                        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5'>
                            {fotos.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setFotoIdx(i)}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${i === fotoIdx ? 'w-4 bg-white' : 'w-2 bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Título */}
                <h1 className='text-2xl md:text-3xl font-bold text-gray-dark mb-6 leading-snug'>
                    {curso.nomeCurso}
                </h1>

                {/* Grid de informações */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
                    <InfoCard icon={<Calendar size={18} className='text-orange-base' />} label='Data'>
                        {formatDate(curso.data)} às {curso.hora}h
                    </InfoCard>
                    <InfoCard icon={<Clock size={18} className='text-orange-base' />} label='Duração'>
                        {curso.duracao}
                    </InfoCard>
                    <InfoCard icon={<User size={18} className='text-orange-base' />} label='Culinarista'>
                        {curso.culinarista}
                    </InfoCard>
                    <InfoCard icon={<MapPin size={18} className='text-orange-base' />} label='Loja'>
                        {curso.loja}
                    </InfoCard>
                    {curso.categoria && (
                        <InfoCard icon={<Tag size={18} className='text-orange-base' />} label='Categoria'>
                            {curso.categoria}
                        </InfoCard>
                    )}
                </div>

                {/* Vagas */}
                <div className='bg-white rounded-xl p-4 shadow-sm mb-8 flex items-center justify-between'>
                    <div>
                        <p className='text-xs font-semibold text-gray-text/50 uppercase tracking-wider mb-0.5'>Vagas disponíveis</p>
                        <p className='text-2xl font-bold text-gray-dark'>{vagasLivres}</p>
                    </div>
                    <div className='text-right'>
                        <p className='text-xs text-gray-text/50'>de {assentos.length} lugares</p>
                        <div className='w-32 h-2 bg-gray-base/20 rounded-full mt-1.5 overflow-hidden'>
                            <div
                                className='h-full bg-orange-base rounded-full transition-all'
                                style={{ width: assentos.length ? `${(vagasLivres / assentos.length) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Botão */}
                <Button
                    className='w-full bg-orange-base hover:bg-orange-light text-white font-semibold text-base py-3 cursor-pointer transition'
                    onClick={() => setStep('form')}
                    disabled={vagasLivres === 0}
                >
                    {vagasLivres === 0 ? 'Vagas esgotadas' : 'Garantir minha vaga'}
                </Button>
            </div>

            {/* Modais */}
            <ModalEnrollmentForm
                isOpen={step === 'form'}
                onClick={() => setStep('assento')}
                onClose={closeModal}
                enrollment={form}
                setEnrollment={setForm}
            />

            <ModalEnrollmentSeats
                isOpen={step === 'assento'}
                onClick={handleSubmit}
                onClose={closeModal}
                enrollment={form}
                setEnrollment={setForm}
                assentos={assentos}
            />

            <ModalEnrollmentSucess
                isOpen={step === 'confirmacao'}
                onClick={closeModal}
                onClose={closeModal}
            />
        </PublicLayout>
    )
}

function InfoCard({ icon, label, children }) {
    return (
        <div className='bg-white rounded-xl p-4 shadow-sm flex items-start gap-3'>
            <div className='mt-0.5 shrink-0'>{icon}</div>
            <div>
                <p className='text-xs font-semibold text-gray-text/50 uppercase tracking-wider mb-0.5'>{label}</p>
                <p className='text-sm font-medium text-gray-dark'>{children}</p>
            </div>
        </div>
    )
}
