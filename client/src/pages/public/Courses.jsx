// REACT
import { useContext, useState, useEffect } from 'react';

// ICONS
import { Menu, Loader2, XCircle } from 'lucide-react'

// DB
import { DadosContext } from '../../contexts/DadosContext';

// SERVICES
import { postEnrollment, putSeatChange, getSeats } from '../../api/enrollment.services';

// HOOKS
import { useThemeColor } from '../../hooks/useThemeColor';

// COMPONENTS
import ModalBranch from '../../components/public/ModalBranch';
import ModalEnrollmentForm from '../../components/public/enrollment/ModalEnrollmentForm';
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats';
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess';
import ModalEnrollmentPayment from '../../components/public/enrollment/ModalEnrollmentPayment';

// SECTIONS
import AllCoursesSections from '../../sections/courses/AllCoursesSections';

// LAYOUTS
import PublicLayout from '../../layouts/public/PublicLayout'

// HEAD 
import { Head } from '../../components/Head'

// IMAGES
import { bannerHome } from '../../assets/images/banner/'

export default function Courses() {

    const {
        cursos,
        loadingCourses,
        culinaristas,
    } = useContext(DadosContext);

    // ========= STATES  =========
    // ========= STATE CADASTRO CLIENTE  ========= 
    const [form, setForm] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        celular: '',
        email: '',
        formaPagamento: 'mercadopago',
        assento: ''
    });

    // ========= STATE FILTERS ========= 
    const [filters, setFilters] = useState({
        dataInicial: '',
        dataFinal: '',
        loja: '',
        culinarista: ''
    });

    // ========= STATE CURSOS ========= 
    const [cursosAtuais, setCursosAtuais] = useState([]);
    const [cursosFiltrados, setCursosFiltrados] = useState([]);

    // ========= STATE VAGAS ========= 
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    // ========= STATE ASSENTOS ========= 
    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [assentos, setAssentos] = useState([]);

    // ========= STATE MODAL =========
    const [step, setStep] = useState(null)
    const [loadingPagamento, setLoadingPagamento] = useState(false)
    const [erroPagamento, setErroPagamento] = useState(null)
    const [inscricaoAtiva, setInscricaoAtiva] = useState(null)
    const [assentoAtual, setAssentoAtual] = useState(null)
    const [payerEmail, setPayerEmail] = useState(null)
    const [pagamentoAprovado, setPagamentoAprovado] = useState(true)

    // ========= FUNCOES  =========
    // =========  FUNCOES CADASTRO CLIENTE =========
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

    const cursoSelecionadoValor = cursos.find(c => c.id === cursoSelecionado)?.valor

    useEffect(() => {
        if (!cursoSelecionado) {
            return
        }

        getSeats(cursoSelecionado)
            .then(setAssentos)
            .catch(console.error)
    }, [cursoSelecionado])

    // ====== FUNCOES

    // buscar vagas livres e reservadas
    useEffect(() => {
        if (!cursos.length) return;

        async function loadVagas() {
            const resultado = {};

            await Promise.all(
                cursos.map(async (curso) => {
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
    }, [cursos, refreshVagas]);

    // PEGAR CURSOS ATUAIS
    useEffect(() => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const cursosFiltrados = cursos
            .filter(c => {
                if (!c.data) return false;
                const [ano, mes, dia] = c.data.split('-');
                const dataCurso = new Date(ano, mes - 1, dia);
                return dataCurso >= hoje;
            })
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        setCursosAtuais(cursosFiltrados);
    }, [cursos]);

    // FILTRAR CURSOS
    useEffect(() => {
            const filtrados = cursosAtuais
                .filter(c =>  !filters.dataInicial || new Date(c.data) >= new Date(filters.dataInicial) )
                .filter(c => !filters.dataFinal || new Date(c.data) <= new Date(filters.dataFinal) )
                .filter(c => !filters.loja || c.loja === filters.loja )
                .filter(c => !filters.culinarista || c.culinarista === filters.culinarista)
            setCursosFiltrados(filtrados)
    }, [filters, cursosAtuais])

    // LIMPAR FILTROS
    function clearFilters() {
        setFilters({
            dataInicial: '',
            dataFinal: '',
            loja: '',
            culinarista: ''
        })
    }

    // =========  FUNCOES MODAL ========= 
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

    // ========= ONLOAD ========= 
    // Carregar filtro de loja inicial
    useEffect(() => {
        const lojaGuardada = localStorage.getItem('loja')
        if (lojaGuardada) {
            setFilters(prev => ({ ...prev, loja: lojaGuardada }))
        } else {
            setStep('filterBranch')
        }
    }, [])
    
    // FUNDO PAGINA
    useThemeColor('#FF8D0A');

    // ROLAR TELA AO TOPO
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <section className='bg-gray mb-20'>

                {/* ================= CONTEUDO ================= */}
                {/* ======== CURSOS ======== */}
                <AllCoursesSections
                    cursosFiltrados={cursosFiltrados}
                    loadingCourses={loadingCourses}
                    vagasPorCurso={vagasPorCurso}
                    openForm={openForm}
                    filters={filters}
                    setFilters={setFilters}
                    culinaristas={culinaristas}
                    clearFilters={clearFilters}
                />

                {/* ================= MODAIS ================= */}
                {/* ======== MODAL SELECIONAR FILIAL ONLOAD ======== */}
                <ModalBranch 
                    isOpen={step === 'filterBranch'}
                    onClose={() => closeModal()}
                    filtersCourses={filters}
                    setFiltersCourses={setFilters}
                    filtersChildrensCourses={filters}
                    setFiltersChildrensCourses={setFilters}
                />

                {/* ======== MODAIS INSCRICOES CURSOS ======== */}
                {/* ======== MODAL FORM ======== */}
                <ModalEnrollmentForm
                    isOpen={step === 'form'}
                    onClick={() => openAssento()}
                    onClose={() => closeModal()}
                    enrollment={form}
                    setEnrollment={setForm}
                />

                {/* ======== MODAL ASSENTOS */}
                <ModalEnrollmentSeats
                    isOpen={step === 'assento'}
                    onClick={handleSubmit}
                    onClose={closeModal}
                    enrollment={form}
                    setEnrollment={setForm}
                    assentos={assentos}
                    assentoAtual={assentoAtual}
                />

                {/* ======== MODAL PAGAMENTO ======== */}
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

                {/* ======== MODAL SUCESS ======== */}
                <ModalEnrollmentSucess
                    isOpen={step === 'confirmacao'}
                    pago={pagamentoAprovado}
                    onClick={() => closeModal()}
                    onClose={closeModal}
                />

                {/* Loading pagamento */}
                {loadingPagamento && (
                    <div className='flex items-center justify-center fixed inset-0 bg-black/70 z-50'>
                        <div className='bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-xl'>
                            <Loader2 size={40} className='text-orange-base animate-spin' />
                            <p className='text-gray-dark font-semibold'>Preparando pagamento...</p>
                        </div>
                    </div>
                )}

                {/* Erro pagamento */}
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

