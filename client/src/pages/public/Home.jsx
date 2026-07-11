// REACT
import { useContext, useState, useEffect } from 'react';
import { Loader2, XCircle } from 'lucide-react';

// DB
import { DadosContext } from '../../contexts/DadosContext';

// SERVICES
import { postEnrollment, getSeats } from '../../api/enrollment.services';

// HOOKS
import { useThemeColor } from '../../hooks/useThemeColor';

// COMPONENTS
import ModalBranch from '../../components/public/ModalBranch';
import ModalEnrollmentForm from '../../components/public/enrollment/ModalEnrollmentForm';
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats';
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess';
import ModalEnrollmentPayment from '../../components/public/enrollment/ModalEnrollmentPayment';

// SECTIONS
import CoursesSections from '../../sections/home/CoursesSections';
import CategoriesSections from '../../sections/home/CategoriesSections';
import ChildrensCoursesSections from '../../sections/home/ChildrensCoursesSections';
import CulinariansSections from '../../sections/home/CulinariansSections';
import IndustriesSections from '../../sections/home/IndustriesSections';
import LocationSections from '../../sections/home/LocationSections';

// LAYOUTS
import PublicLayout from '../../layouts/public/PublicLayout'

// HEAD 
import { Head } from '../../components/Head'

// IMAGES
import { bannerHome } from '../../assets/images/banner/'

export default function Home() {

    // CONTEXT
    const {
        cursos,
        cursosInfantis,
        culinaristas,
        industrias,
        loadingCourses,
        loadingCulinarian,
        loadingIndustries,
        loadingChildren
    } = useContext(DadosContext);

    // ========= STATES  =========
    // ========= STATE CADASTRO CLIENTE  ========= 
    const [enrollment, setEnrollment] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        celular: '',
        email: '',
        assento: ''
    });

    // ========= STATE FILTERS CURSOS ========= 
    const [filtersCourses, setFiltersCourses] = useState({
        dataInicial: '',
        dataFinal: '',
        loja: '',
        culinarista: ''
    });

    // ========= STATE FILTERS CURSOS INFANTIS ========= 
    const [filtersChildrensCourses, setFiltersChildrensCourses] = useState({
        dataInicial: '',
        dataFinal: '',
        loja: '',
        culinarista: ''
    });

    // ========= STATE CURSOS ========= 
    const [cursosAtuais, setCursosAtuais] = useState([]);
    const [cursosFiltrados, setCursosFiltrados] = useState([]);

    const [cursosInfantisAtuais, setCursosInfantisAtuais] = useState([]);
    const [cursosInfantisFiltrados, setCursosInfantisFiltrados] = useState([]);

    // ========= STATE VAGAS ========= 
    const [loadingVagasPorCurso, setLoadingVagasPorCurso] = useState(true);
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    const [loadingVagasPorCursoInfantis, setLoadingVagasPorCursoInfantis] = useState(true);
    const [vagasPorCursoInfantil, setVagasPorCursoInfantil] = useState({});
    const [refreshVagasInfantis, setRefreshVagasInfantis] = useState(0);

    // ========= STATE ASSENTOS ========= 
    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [assentos, setAssentos] = useState([]);

    // ========= STATE MODAL =========
    const [step, setStep] = useState(null)
    const [loadingPagamento, setLoadingPagamento] = useState(false)
    const [erroPagamento, setErroPagamento] = useState(null)
    const [inscricaoAtiva, setInscricaoAtiva] = useState(null)
    const [payerEmail, setPayerEmail] = useState(null)
    const [pagamentoAprovado, setPagamentoAprovado] = useState(true)

    // ====== FUNCOES
    async function handleSubmitCourse() {
        setStep(null)
        setLoadingPagamento(true)
        setErroPagamento(null)

        try {
            const res = await postEnrollment({
                cursoId: enrollment.cursoId,
                nome: enrollment.nome,
                cpf: enrollment.cpf,
                celular: enrollment.celular,
                email: enrollment.email,
                formaPagamento: 'mercadopago',
                assento: enrollment.assento
            });

            if (!res || res.message) {
                setErroPagamento(res?.message || 'Erro ao criar inscrição. Tente novamente.');
                return;
            }

            // Tag manager google
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'form_submit_success', form_name: 'cadastro_curso' });

            setPayerEmail(enrollment.email)
            setEnrollment({ cursoId: '', nome: '', cpf: '', celular: '', email: '', assento: '' });

            setInscricaoAtiva(res.id)
            setStep('pagamento')
        } catch (err) {
            console.error(err);
            setErroPagamento('Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setLoadingPagamento(false)
        }
    }

    const cursoSelecionadoValor = (
        cursos.find(c => c.id === cursoSelecionado) ||
        cursosInfantis.find(c => c.id === cursoSelecionado)
    )?.valor

    useEffect(() => {
        if (!cursoSelecionado) {
            return
        }

        getSeats(cursoSelecionado)
            .then(setAssentos)
            .catch(console.error)
        
    }, [cursoSelecionado])

    // ========= FUNCOES CURSOS =========
    // buscar vagas livres e reservadas
    useEffect(() => {
        if (!cursos.length) return;

        async function loadVagas() {
            setLoadingVagasPorCurso(true);

            try {
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

            } catch (err) {
                console.log(err);

            } finally {
                setLoadingVagasPorCurso(false);
            }
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
                .filter(c =>  !filtersCourses.dataInicial || new Date(c.data) >= new Date(filtersCourses.dataInicial) )
                .filter(c => !filtersCourses.dataFinal || new Date(c.data) <= new Date(filtersCourses.dataFinal) )
                .filter(c => !filtersCourses.loja || c.loja === filtersCourses.loja )
                .filter(c => !filtersCourses.culinarista || c.culinarista === filtersCourses.culinarista)
            setCursosFiltrados(filtrados)
    }, [filtersCourses, cursosAtuais])

    // ========= FUNCOES CURSOS INFANTIS =========
    // buscar vagas livres e reservadas
    useEffect(() => {
        if (!cursosInfantis.length) return;

        async function loadVagas() {
            setLoadingVagasPorCursoInfantis(true)

            try {
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
                
                setVagasPorCursoInfantil(resultado);

            } catch (err) {
                console.log(err);

            } finally {
                setLoadingVagasPorCursoInfantis(false)
            }
        }

        loadVagas();
    }, [cursosInfantis, refreshVagasInfantis]);

    // PEGAR CURSOS ATUAIS
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

        setCursosInfantisAtuais(cursosFiltrados);
    }, [cursosInfantis]);

    // FILTRAR CURSOS
    useEffect(() => {
            const filtrados = cursosInfantisAtuais
                .filter(c =>  !filtersChildrensCourses.dataInicial || new Date(c.data) >= new Date(filtersChildrensCourses.dataInicial) )
                .filter(c => !filtersChildrensCourses.dataFinal || new Date(c.data) <= new Date(filtersChildrensCourses.dataFinal) )
                .filter(c => !filtersChildrensCourses.loja || c.loja === filtersChildrensCourses.loja )
                .filter(c => !filtersChildrensCourses.culinarista || c.culinarista === filtersChildrensCourses.culinarista)
            setCursosInfantisFiltrados(filtrados)
    }, [filtersChildrensCourses, cursosInfantisAtuais])


    // =========  FUNCOES MODAL ========= 
    const openForm = (cursoId) => {
        setEnrollment(prev => ({ ...prev, cursoId }))
        setStep('form')
        setCursoSelecionado(cursoId)
        console.log(step)
    }

    const openAssento = () => setStep('assento')

    const closeModal = () => {
        setStep(null)
        setEnrollment({ cursoId: '', nome: '', cpf: '', celular: '', email: '', assento: '' })
        setCursoSelecionado('')
        setInscricaoAtiva(null)
        setPayerEmail(null)
        setRefreshVagas(prev => prev + 1);
        setRefreshVagasInfantis(prev => prev + 1);
    }

    // ========= ONLOAD ========= 
    // Carregar filtro de loja inicial
    useEffect(() => {
        const lojaGuardada = localStorage.getItem('loja')
        if (lojaGuardada) {
            setFiltersCourses(prev => ({ ...prev, loja: lojaGuardada }))
            setFiltersChildrensCourses(prev => ({ ...prev, loja: lojaGuardada }))
        } else {
            setStep('filterBranch')
        }
    }, [])
    
    // FUNDO PAGINA
    useThemeColor('#FF8D0A');

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <section className='bg-gray mb-20'>
                
                {/* ================= CONTEUDO ================= */}
                {/* ======== CURSOS ======== */}
                <CoursesSections
                    cursosFiltrados={cursosFiltrados}
                    loadingCourses={loadingCourses}
                    loadingVagasPorCurso={loadingVagasPorCurso}
                    vagasPorCurso={vagasPorCurso}
                    openForm={openForm}
                />

                {/* ======== CATEGORIAS ======== */}
                <CategoriesSections />

                {/* ======== CURSOS INFANTIS ======== */}
                <ChildrensCoursesSections
                    cursosInfantisFiltrados={cursosInfantisFiltrados}
                    loadingChildren={loadingChildren}
                    loadingVagasPorCursoInfantis={loadingVagasPorCursoInfantis}
                    vagasPorCursoInfantil={vagasPorCursoInfantil}
                    openForm={openForm}
                />

                {/* ======== CULINARISTAS ======== */}
                <CulinariansSections 
                    culinaristas={culinaristas}
                    loadingCulinarian={loadingCulinarian}
                />

                {/* ======== INDUSTRIAS ======== */}
                {industrias.length === 0 
                    ? ''
                    :<IndustriesSections
                        industrias={industrias}
                        loadingIndustries={loadingIndustries}
                    />
                }

                {/* ======== LOCALIZAÇÃO ======== */}
                <LocationSections/>

                {/* ================= MODAIS ================= */}
                {/* ======== MODAL SELECIONAR FILIAL ONLOAD ======== */}
                <ModalBranch 
                    isOpen={step === 'filterBranch'}
                    onClose={() => closeModal()}
                    filtersCourses={filtersCourses}
                    setFiltersCourses={setFiltersCourses}
                    filtersChildrensCourses={filtersChildrensCourses}
                    setFiltersChildrensCourses={setFiltersChildrensCourses}
                />

                {/* ======== MODAIS INSCRICOES CURSOS ======== */}
                {/* ======== MODAL FORM ======== */}
                <ModalEnrollmentForm
                    isOpen={step === 'form'}
                    onClick={() => openAssento()}
                    onClose={() => closeModal()}
                    enrollment={enrollment}
                    setEnrollment={setEnrollment}
                />

                {/* ======== MODAL ASSENTOS */}
                <ModalEnrollmentSeats
                    isOpen={step === 'assento'}
                    onClick={handleSubmitCourse}
                    onClose={closeModal}
                    enrollment={enrollment}
                    setEnrollment={setEnrollment}
                    assentos={assentos}
                />

                {/* ======== MODAL PAGAMENTO ======== */}
                <ModalEnrollmentPayment
                    isOpen={step === 'pagamento'}
                    inscricaoId={inscricaoAtiva}
                    valor={cursoSelecionadoValor}
                    payerEmail={payerEmail}
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
                                onClick={() => { setErroPagamento(null); setStep('form') }}
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

