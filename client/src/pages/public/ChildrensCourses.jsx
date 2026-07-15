import { useContext, useState, useEffect } from 'react';

import { Loader2, XCircle } from 'lucide-react'

import { DadosContext } from '../../contexts/DadosContext';

import { postEnrollment, putSeatChange, getSeats } from '../../api/enrollment.services';

import { useThemeColor } from '../../hooks/useThemeColor';

import ModalBranch from '../../components/public/ModalBranch';
import ModalFilters from '../../components/public/ModalFilters';
import ModalEnrollmentForm from '../../components/public/enrollment/ModalEnrollmentForm';
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats';
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess';
import ModalEnrollmentPayment from '../../components/public/enrollment/ModalEnrollmentPayment';

import AllChildrensCoursesSections from '../../sections/childrens/AllChildrensCoursesSections';

import PublicLayout from '../../layouts/public/PublicLayout'

import { Head } from '../../components/Head'

import { bannerHome } from '../../assets/images/banner/'

export default function ChildrensCourses() {

    const {
        cursosInfantis,
        culinaristas,
    } = useContext(DadosContext);

    const [form, setForm] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        celular: '',
        email: '',
        assento: ''
    });

    const [filters, setFilters] = useState({
        dataInicial: '',
        dataFinal: '',
        loja: '',
        culinarista: ''
    });
    const [showModalFilters, setShowModalFilters] = useState(false);

    const [cursosAtuais, setCursosAtuais] = useState([]);
    const [cursosFiltrados, setCursosFiltrados] = useState([]);

    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [assentos, setAssentos] = useState([]);

    const [step, setStep] = useState(null)
    const [loadingPagamento, setLoadingPagamento] = useState(false)
    const [erroPagamento, setErroPagamento] = useState(null)
    const [inscricaoAtiva, setInscricaoAtiva] = useState(null)
    const [assentoAtual, setAssentoAtual] = useState(null)
    const [payerEmail, setPayerEmail] = useState(null)
    const [pagamentoAprovado, setPagamentoAprovado] = useState(true)

    async function handleSubmit() {
        setStep(null)
        setLoadingPagamento(true)
        setErroPagamento(null)

        try {
            // já existe inscrição ativa: está só trocando de assento, não criando outra
            if (inscricaoAtiva) {
                const resultado = await putSeatChange(inscricaoAtiva, form.assento);
                if (!resultado?.ok) {
                    setErroPagamento(resultado?.message || 'Não foi possível trocar de assento. Tente novamente.');
                    setStep('assento');
                    return;
                }
                setAssentoAtual(form.assento);
                setStep('pagamento');
                return;
            }

            const inscricao = await postEnrollment({
                cursoId: form.cursoId,
                nome: form.nome,
                cpf: form.cpf,
                celular: form.celular,
                email: form.email,
                formaPagamento: 'mercadopago',
                assento: form.assento,
            });

            if (!inscricao || inscricao.message) {
                setErroPagamento(inscricao?.message || 'Erro ao criar inscrição. Tente novamente.');
                return;
            }

            setPayerEmail(form.email)
            setForm(prev => ({ ...prev, nome: '', cpf: '', celular: '', email: '' }));

            setAssentoAtual(inscricao.assento)
            setInscricaoAtiva(inscricao.id)
            setStep('pagamento')
        } catch {
            setErroPagamento('Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setLoadingPagamento(false)
        }
    }

    // Volta pra tela de assentos sem cancelar a inscrição já criada
    async function handleTrocarAssento() {
        try {
            const dados = await getSeats(cursoSelecionado);
            setAssentos(dados);
        } catch (err) {
            console.error(err);
        }
        setStep('assento');
    }

    const cursoSelecionadoValor = cursosInfantis.find(c => c.id === cursoSelecionado)?.valor

    useEffect(() => {
        if (!cursoSelecionado) {
            return
        }

        getSeats(cursoSelecionado)
            .then(setAssentos)
            .catch(console.error)
    }, [cursoSelecionado])

    useEffect(() => {
        if (!cursosInfantis.length) return;

        async function loadVagas() {
            const resultado = {};

            await Promise.all(
                cursosInfantis.map(async (curso) => {
                    const assentos = await getSeats(curso.id);
                    resultado[curso.id] = {
                        livres: assentos.filter(v => v.status === 'livre').length,
                        reservadas: assentos.filter(v => v.status === 'reservado').length
                    };
                })
            );

            setVagasPorCurso(resultado);
        }

        loadVagas();
    }, [cursosInfantis, refreshVagas]);

    useEffect(() => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const cursosFiltrados = cursosInfantis
            .filter(c => {
                if (!c.data) return false;
                const [ano, mes, dia] = c.data.split('-');
                const dataCurso = new Date(ano, mes - 1, dia);
                return dataCurso >= hoje;
            })
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        setCursosAtuais(cursosFiltrados);
    }, [cursosInfantis]);

    useEffect(() => {
            const filtrados = cursosAtuais
                .filter(c =>  !filters.dataInicial || new Date(c.data) >= new Date(filters.dataInicial) )
                .filter(c => !filters.dataFinal || new Date(c.data) <= new Date(filters.dataFinal) )
                .filter(c => !filters.loja || c.loja === filters.loja )
                .filter(c => !filters.culinarista || c.culinarista === filters.culinarista)
            setCursosFiltrados(filtrados)
    }, [filters, cursosAtuais])

    function clearFilters() {
        setFilters({
            dataInicial: '',
            dataFinal: '',
            loja: '',
            culinarista: ''
        })
    }

    const openForm = (cursoId) => {
        setForm(prev => ({ ...prev, cursoId }))
        setStep('form')
        setCursoSelecionado(cursoId)
    }

    const openAssento = () => setStep('assento')

    const closeModal = () => {
        setStep(null)
        setForm({ cursoId: '', nome: '', cpf: '', celular: '', email: '', assento: '' })
        setCursoSelecionado('')
        setInscricaoAtiva(null)
        setAssentoAtual(null)
        setPayerEmail(null)
        setRefreshVagas(prev => prev + 1);
    }

    useEffect(() => {
        const lojaGuardada = localStorage.getItem('loja')
        if (lojaGuardada) {
            setFilters(prev => ({ ...prev, loja: lojaGuardada }))
        } else {
            setStep('filterBranch')
        }
    }, [])

    useThemeColor('#FF8D0A');

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos Infantis' />
            <section className='bg-gray mb-20'>

                <AllChildrensCoursesSections
                    cursosFiltrados={cursosFiltrados}
                    vagasPorCurso={vagasPorCurso}
                    openForm={openForm}
                    showModalFilters={showModalFilters}
                    setShowModalFilters={setShowModalFilters}
                    filters={filters}
                    setFilters={setFilters}
                    culinaristas={culinaristas}
                    clearFilters={clearFilters}
                />

                <ModalFilters
                    isOpen={showModalFilters}
                    onClose={() => setShowModalFilters(false)}
                    nameModal='Filtros'
                    culinaristas={culinaristas}
                    filtersCourses={filters}
                    setFiltersCourses={setFilters}
                    clear={() => { clearFilters(); setShowModalFilters(false); }}
                />

                <ModalBranch
                    isOpen={step === 'filterBranch'}
                    onClose={() => closeModal()}
                    filtersCourses={filters}
                    setFiltersCourses={setFilters}
                    filtersChildrensCourses={filters}
                    setFiltersChildrensCourses={setFilters}
                />

                <ModalEnrollmentForm
                    isOpen={step === 'form'}
                    onClick={() => openAssento()}
                    onClose={() => closeModal()}
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
                    assentoAtual={assentoAtual}
                />

                <ModalEnrollmentPayment
                    isOpen={step === 'pagamento'}
                    inscricaoId={inscricaoAtiva}
                    valor={cursoSelecionadoValor}
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
                    onClick={() => closeModal()}
                    onClose={closeModal}
                />

                {loadingPagamento && (
                    <div className='flex items-center justify-center fixed inset-0 bg-black/70 z-50'>
                        <div className='bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-xl'>
                            <Loader2 size={40} className='text-orange-base animate-spin' />
                            <p className='text-gray-dark font-semibold'>Preparando pagamento...</p>
                        </div>
                    </div>
                )}

                {erroPagamento && (
                    <div
                        className='flex items-center justify-center fixed inset-0 bg-black/70 z-50 p-4'
                        onClick={() => setErroPagamento(null)}
                    >
                        <div
                            className='bg-white rounded-xl p-8 flex flex-col items-center gap-4 max-w-sm w-full shadow-xl'
                            onClick={e => e.stopPropagation()}
                        >
                            <XCircle size={48} className='text-red-500' />
                            <p className='text-gray-dark font-semibold text-center'>{erroPagamento}</p>
                            <button
                                className='bg-orange-base text-white hover:bg-orange-light w-full py-2.5 rounded-lg font-semibold'
                                onClick={() => { setErroPagamento(null); setStep(inscricaoAtiva ? 'assento' : 'form') }}
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )}

            </section>
        </PublicLayout>
    )
}
