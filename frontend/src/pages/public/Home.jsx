// REACT 
import { useContext, useState, useEffect } from 'react';

// CONTEXT
import { DadosContext } from '../../contexts/DadosContext';

// SERVICES
import { postEnrollment, getSeats } from '../../api/enrollment.services';

// HOOKS
import { useThemeColor } from '../../hooks/useThemeColor';

// COMPONENTS
import ModalEnrollmentForm from '../../components/public/enrollment/ModalEnrollmentForm';
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats';
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess';
import ModalFilters from '../../components/public/ModalFilters';

// SECTIONS
import CoursesSections from '../../sections/home/CoursesSections';
import CategoriesSections from '../../sections/home/CategoriesSections';
import ChildrensCoursesSections from '../../sections/home/ChildrensCoursesSections';
import CulinariansSections from '../../sections/home/CulinariansSections';
import IndustriesSections from '../../sections/home/IndustriesSections';
import LocationSections from '../../sections/home/LocationSections';

// LAYOUT
import PublicLayout from '../../layouts/public/PublicLayout';

// HEAD 
import { Head } from '../../components/Head';

// IMAGES
import { bannerHome } from '../../assets/images/banner/';

export default function Home() {

    const {
        cursos,
        cursosInfantis,
        culinaristas,
        industrias,
    } = useContext(DadosContext);

    useEffect(() => {
        console.log(cursosFiltrados)
    }, [])

    // ========= STATE ENROLLMENT ========= 
    const [enrollment, setEnrollment] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        celular: '',
        formaPagamento: '',
        assento: ''
    });

    // ========= FILTERS ========= 
    const [filtersCourses, setFiltersCourses] = useState({
        dataInicial: '',
        dataFinal: '',
        loja: '',
        culinarista: ''
    });

    const [filtersChildrensCourses, setFiltersChildrensCourses] = useState({
        dataInicial: '',
        dataFinal: '',
        loja: '',
        culinarista: ''
    });

    // ========= CURSOS ========= 
    const [cursosAtuais, setCursosAtuais] = useState([]);
    const [cursosFiltrados, setCursosFiltrados] = useState([]);

    const [cursosInfantisAtuais, setCursosInfantisAtuais] = useState([]);
    const [cursosInfantisFiltrados, setCursosInfantisFiltrados] = useState([]);

    // ========= VAGAS ========= 
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    const [vagasPorCursoInfantil, setVagasPorCursoInfantil] = useState({});
    const [refreshVagasInfantis, setRefreshVagasInfantis] = useState(0);

    // ========= ASSENTOS ========= 
    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [assentos, setAssentos] = useState([]);

    // ========= MODAL ========= 
    const [step, setStep] = useState(null);
    const [showModalFilters, setShowModalFilters] = useState(false);
    const [showModalFiltersChildrens, setShowModalFiltersChildrens] = useState(false);

    // ========= SUBMIT =========
    function handleSubmitCourse() {
        if (!enrollment.nome || !enrollment.cpf || !enrollment.celular || !enrollment.formaPagamento) {
            alert('Preencha todos os campos.');
            return;
        }

        postEnrollment(enrollment);

        setEnrollment({
            cursoId: '',
            nome: '',
            cpf: '',
            telefone: '',
            formaPagamento: '',
            assento: ''
        });
    }

    // ========= ASSENTOS =========
    useEffect(() => {
        if (!cursoSelecionado) return;

        getSeats(cursoSelecionado)
            .then(setAssentos)
            .catch(console.error);
    }, [cursoSelecionado]);

    // ========= VAGAS CURSOS =========
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

    // ========= CURSOS ATUAIS =========
    useEffect(() => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const filtrados = cursos.filter(c => {
            if (!c.data) return false;
            return new Date(c.data) >= hoje;
        });

        setCursosAtuais(filtrados);
    }, [cursos]);

    // ========= FILTROS CURSOS =========
    useEffect(() => {
        const filtrados = cursosAtuais
            .filter(c => !filtersCourses.dataInicial || new Date(c.data) >= new Date(filtersCourses.dataInicial))
            .filter(c => !filtersCourses.dataFinal || new Date(c.data) <= new Date(filtersCourses.dataFinal))
            .filter(c => !filtersCourses.loja || c.loja === filtersCourses.loja)
            .filter(c => !filtersCourses.culinarista || c.culinarista === filtersCourses.culinarista);

        setCursosFiltrados(filtrados);
    }, [filtersCourses, cursosAtuais]);

    function clearFilters() {
        setFiltersCourses({
            dataInicial: '',
            dataFinal: '',
            loja: '',
            culinarista: ''
        });
    }

    // ========= CURSOS INFANTIS =========
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

    useEffect(() => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const filtrados = cursosInfantis.filter(c => {
            if (!c.data) return false;
            return new Date(c.data) >= hoje;
        });

        setCursosInfantisAtuais(filtrados);
    }, [cursosInfantis]);

    useEffect(() => {
        const filtrados = cursosInfantisAtuais
            .filter(c => !filtersChildrensCourses.dataInicial || new Date(c.data) >= new Date(filtersChildrensCourses.dataInicial))
            .filter(c => !filtersChildrensCourses.dataFinal || new Date(c.data) <= new Date(filtersChildrensCourses.dataFinal))
            .filter(c => !filtersChildrensCourses.loja || c.loja === filtersChildrensCourses.loja)
            .filter(c => !filtersChildrensCourses.culinarista || c.culinarista === filtersChildrensCourses.culinarista);

        setCursosInfantisFiltrados(filtrados);
    }, [filtersChildrensCourses, cursosInfantisAtuais]);

    function clearChildrenFilters() {
        setFiltersChildrensCourses({
            dataInicial: '',
            dataFinal: '',
            loja: '',
            culinarista: ''
        });
    }

    // ========= MODAIS =========
    const openForm = (cursoId) => {
        setEnrollment(prev => ({ ...prev, cursoId }));
        setStep('form');
        setCursoSelecionado(cursoId);
    };

    const openAssento = () => {
        if (!enrollment.nome || !enrollment.cpf || !enrollment.celular || !enrollment.formaPagamento) {
            alert('Preencha todos os campos.');
            return;
        }
        console.log('clicado')
        setStep('assento');
    };

    const openConfirmacao = () => {
        if (!enrollment.assento) {
            alert('Selecione um assento.');
            return;
        }
        setStep('confirmacao');
    };

    const closeModal = () => {
        setStep(null);
        setEnrollment({
            cursoId: '',
            nome: '',
            cpf: '',
            celular: '',
            formaPagamento: '',
            assento: ''
        });
        setCursoSelecionado('');
        setRefreshVagas(prev => prev + 1);
        setRefreshVagasInfantis(prev => prev + 1);
    };

    useThemeColor('#FF8D0A');

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />

            <section className='bg-gray mb-20'>

                <CoursesSections
                    cursosFiltrados={cursosFiltrados}
                    vagasPorCurso={vagasPorCurso}
                    openForm={openForm}
                    showModalFilters={showModalFilters}
                    setShowModalFilters={setShowModalFilters}
                />

                <CategoriesSections />

                <ChildrensCoursesSections
                    cursosInfantisFiltrados={cursosInfantisFiltrados}
                    vagasPorCursoInfantil={vagasPorCursoInfantil}
                    openForm={openForm}
                    showModalFilters={showModalFiltersChildrens}
                    setShowModalFilters={setShowModalFiltersChildrens}
                />

                <CulinariansSections culinaristas={culinaristas} />

                <IndustriesSections industrias={industrias} />

                <LocationSections />

                {/* MODAIS */}
                <ModalEnrollmentForm
                    isOpen={step === 'form'}
                    onClick={openAssento}
                    onClose={closeModal}
                    enrollment={enrollment}
                    setEnrollment={setEnrollment}
                />

                <ModalEnrollmentSeats
                    isOpen={step === 'assento'}
                    onClick={() => {
                        handleSubmitCourse();
                        openConfirmacao();
                    }}
                    onClose={closeModal}
                    enrollment={enrollment}
                    setEnrollment={setEnrollment}
                    assentos={assentos}
                />

                <ModalEnrollmentSucess
                    isOpen={step === 'confirmacao'}
                    onClick={closeModal}
                    onClose={closeModal}
                />

                {showModalFilters && (
                    <ModalFilters
                        isOpen={showModalFilters}
                        nameModal='Filtros Cursos'
                        onClose={() => setShowModalFilters(prev => !prev)}
                        filtersCourses={filtersCourses}
                        setFiltersCourses={setFiltersCourses}
                        culinaristas={culinaristas}
                        clear={clearFilters}
                    />
                )}

                {showModalFiltersChildrens && (
                    <ModalFilters
                        isOpen={showModalFiltersChildrens}
                        nameModal='Filtros Cursos Infantis'
                        onClose={() => setShowModalFiltersChildrens(prev => !prev)}
                        filtersCourses={filtersChildrensCourses}
                        setFiltersCourses={setFiltersChildrensCourses}
                        culinaristas={culinaristas}
                        clear={clearChildrenFilters}
                    />
                )}

            </section>
        </PublicLayout>
    );
}