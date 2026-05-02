// REACT 
import { useContext, useState, useEffect } from 'react';

// DB
import { DadosContext } from '../../contexts/DadosContext';

// SERVICES
import { postEnrollment, getSeats } from '../../api/enrollment.services';

// HOOKS
import { useThemeColor } from '../../hooks/useThemeColor';

// COMPONENTS
import Text from '../../components/Text'
import ModalEnrollmentForm from '../../components/public/enrollment/ModalEnrollmentForm';
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats';
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess';

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
import ModalFilters from '../../components/public/ModalFilters';

export default function Home() {

    // CONTEXT
    const {
        cursos,
        cursosInfantis,
        culinaristas,
        industrias,
    } = useContext(DadosContext);

    // ========= STATES  =========
    // ========= STATE CADASTRO CLIENTE  ========= 
    const [enrollment, setEnrollment] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        telefone: '',
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
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    const [vagasPorCursoInfantil, setVagasPorCursoInfantil] = useState({});
    const [refreshVagasInfantis, setRefreshVagasInfantis] = useState(0);

    // ========= STATE ASSENTOS ========= 
    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [assentos, setAssentos] = useState([]);

    // ========= STATE MODAL ========= 
    const [step, setStep] = useState(null)
    const [showModalFilters, setShowModalFilters ] = useState(false)
    const [showModalFiltersChildrens, setShowModalFiltersChildrens ] = useState(false)

    // ====== FUNCOES
    function handleSubmitCourse() {
        if (!enrollment.nome || !enrollment.cpf || !enrollment.celular || !enrollment.formaPagamento) {
            alert('Preencha todos os campos.')
            return;
        }

        postEnrollment({
            cursoId: enrollment.cursoId,
            nome: enrollment.nome,
            cpf: enrollment.cpf,
            celular: enrollment.celular,
            formaPagamento: enrollment.formaPagamento,
            assento: enrollment.assento
        });

    ({
            cursoId: '',
            nome: '',
            cpf: '',
            celular: '',
            formaPagamento: '', 
            assento: ''
        });
    }

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

        const cursosFiltrados = cursos.filter(c => {
            if (!c.data) return false;

            const dataCurso = new Date(c.data);
            dataCurso.setHours(0, 0, 0, 0);

            return dataCurso >= hoje;
        });

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

    // LIMPAR FILTROS
    function clearFilters() {
        setFiltersCourses({
            dataInicial: '',
            dataFinal: '',
            loja: '',
            culinarista: ''
        })
    }

    // ========= FUNCOES CURSOS INFANTIS =========
    // buscar vagas livres e reservadas
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

            setVagasPorCursoInfantil(resultado);
        }

        loadVagas();
    }, [cursosInfantis, refreshVagasInfantis]);

    // PEGAR CURSOS ATUAIS
    useEffect(() => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const cursosFiltrados = cursosInfantis.filter(c => {
            if (!c.data) return false;

            const dataCurso = new Date(c.data);
            dataCurso.setHours(0, 0, 0, 0);

            return dataCurso >= hoje;
        });

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

    // LIMPAR FILTROS
    function clearChildrenFilters() {
        setFiltersChildrensCourses({
            dataInicial: '',
            dataFinal: '',
            loja: '',
            culinarista: ''
        })
    }

    // =========  FUNCOES MODAL ========= 
    const openForm = (cursoId) => {
        setEnrollment(prev => ({ ...prev, cursoId }))
        setStep('form')
        setCursoSelecionado(cursoId)
        console.log(step)
    }

    const openAssento = () => {
        if (!enrollment.nome || !enrollment.cpf || !enrollment.celular || !enrollment.formaPagamento) {
            alert('Preencha todos os campos.')
            return;
        }
        setStep('assento')
    }

    const openConfirmacao = () => {
        if (!enrollment.assento) {
            alert('Marque algum assento.');
            return
        }
        setStep('confirmacao')
    }

    const closeModal = () => {
        setStep(null)
        setEnrollment({ cursoId: '', nome: '', cpf: '', telefone: '', formaPagamento: '', assento: '' })
        setCursoSelecionado('')
        setRefreshVagas(prev => prev + 1);
        setRefreshVagasInfantis(prev => prev + 1);
    }
    
    // FUNDO PAGINA
    useThemeColor('#FF8D0A');

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <Text as='section' className='bg-gray mb-20'>
                
                {/* ================= CONTEUDO ================= */}
                {/* ======== CURSOS ======== */}
                <CoursesSections
                    cursosFiltrados={cursosFiltrados}
                    vagasPorCurso={vagasPorCurso}
                    openForm={openForm}
                    showModalFilters={showModalFilters}
                    setShowModalFilters={setShowModalFilters}
                />

                {/* ======== CATEGORIAS ======== */}
                <CategoriesSections />

                {/* ======== CURSOS INFANTIS ======== */}
                <ChildrensCoursesSections
                    cursosInfantisFiltrados={cursosInfantisFiltrados}
                    vagasPorCursoInfantil={vagasPorCursoInfantil}
                    openForm={openForm}
                    showModalFilters={showModalFiltersChildrens}
                    setShowModalFilters={setShowModalFiltersChildrens}
                />

                {/* ======== CULINARISTAS ======== */}
                <CulinariansSections 
                    culinaristas={culinaristas}
                />

                {/* ======== INDUSTRIAS ======== */}
                <IndustriesSections
                    industrias={industrias}
                />

                {/* ======== LOCALIZAÇÃO ======== */}
                <LocationSections/>

                {/* ================= MODAIS ================= */}

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
                    onClick={() => {
                        handleSubmitCourse()
                        openConfirmacao()
                    }}
                    onClose={closeModal}
                    enrollment={enrollment}
                    setEnrollment={setEnrollment}
                    assentos={assentos}
                />

                {/* ======== MODAL SUCESS ======== */}
                <ModalEnrollmentSucess
                    isOpen={step === 'confirmacao'}
                    onClick={() => closeModal()}
                    onClose={closeModal}
                />

                {/* ======== MODAL FILTERS CURSOS ======== */}
                {showModalFilters && 
                    <ModalFilters
                        isOpen={showModalFilters}
                        nameModal={'Filtros Cursos'}
                        onClose={() => setShowModalFilters(!showModalFilters)}
                        filtersCourses={filtersCourses}
                        setFiltersCourses={setFiltersCourses}
                        culinaristas={culinaristas}
                        clear={() => {
                            clearFilters()
                        }}
                    />
                }

                {/* ======== MODAL FILTERS CURSOS INFANTIS ======== */}
                {showModalFiltersChildrens && 
                    <ModalFilters
                        isOpen={showModalFiltersChildrens}
                        nameModal={'Filtros Cursos Infantis'}
                        onClose={() => setShowModalFiltersChildrens(!showModalFiltersChildrens)}
                        filtersCourses={filtersChildrensCourses}
                        setFiltersCourses={setFiltersChildrensCourses}
                        culinaristas={culinaristas}
                        clear={() => {
                            clearChildrenFilters()
                        }}
                    />
                }
            </Text>
        </PublicLayout>
    )
}

