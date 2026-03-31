// REACT 
import { useContext, useState, useEffect } from 'react';

// ICONS
import { Menu } from 'lucide-react'

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
import AllCoursesSections from '../../sections/courses/AllCoursesSections';

// LAYOUTS
import PublicLayout from '../../layouts/public/PublicLayout'

// HEAD 
import { Head } from '../../components/Head'

// IMAGES
import { bannerHome } from '../../assets/images/banner/'
import ModalFilters from '../../components/public/ModalFilters';

export default function ChildrensCourses() {

    const {
        cursos,
        culinaristas,
    } = useContext(DadosContext);

    // ========= STATES  =========
    // ========= STATE CADASTRO CLIENTE  ========= 
    const [form, setForm] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        telefone: '',
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
    const [showModalFilters, setShowModalFilters ] = useState(false)

    // ========= FUNCOES  =========
    // =========  FUNCOES CADASTRO CLIENTE ========= 
    function handleSubmit() {
        if (!form.nome || !form.cpf || !form.celular || !form.formaPagamento) {
            alert('Preencha todos os campos.')
            return;
        }

        postEnrollment({
            cursoId: form.cursoId,
            nome: form.nome,
            cpf: form.cpf,
            celular: form.celular,
            formaPagamento: form.formaPagamento,
            assento: form.assento
        });

        setForm({
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

    const openAssento = () => {
        if (!form.nome || !form.cpf || !form.celular || !form.formaPagamento) {
            alert('Preencha todos os campos.')
            return;
        }
        setStep('assento')
    }

    const openConfirmacao = () => {
        if (!form.assento) {
            alert('Marque algum assento.');
            return
        }
        setStep('confirmacao')
    }

    const closeModal = () => {
        setStep(null)
        setForm({ cursoId: '', nome: '', cpf: '', telefone: '', formaPagamento: '', assento: '' })
        setCursoSelecionado('')
        setRefreshVagas(prev => prev + 1);
    }
    
    // FUNDO PAGINA
    useThemeColor('#FF8D0A');

    // ROLAR TELA AO TOPO
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <Text as='section' className='bg-gray'>

                {/* ================= CONTEUDO ================= */}
                {/* ======== CURSOS ======== */}
                <AllCoursesSections
                    cursosFiltrados={cursosFiltrados}
                    vagasPorCurso={vagasPorCurso}
                    openForm={openForm}
                    showModalFilters={showModalFilters}
                    setShowModalFilters={setShowModalFilters}
                />

                {/* ================= MODAIS ================= */}
                {/* ======== MODAL FORM ======== */}
                <ModalEnrollmentForm
                    isOpen={step === 'form'}
                    onClick={() => openAssento()}
                    onClose={() => closeModal()}
                    form={form}
                    setForm={setForm}
                />

                {/* ======== MODAL ASSENTOS */}
                <ModalEnrollmentSeats
                    isOpen={step === 'assento'}
                    onClick={() => {
                        handleSubmit()
                        openConfirmacao()
                    }}
                    onClose={closeModal}
                    form={form}
                    setForm={setForm}
                    assentos={assentos}
                />

                {/* ======== MODAL SUCESS ======== */}
                <ModalEnrollmentSucess
                    isOpen={step === 'confirmacao'}
                    onClick={() => closeModal()}
                    onClose={closeModal}
                />

                {/* ======== MODAL FILTERS ======== */}
                {showModalFilters && 
                    <ModalFilters
                        isOpen={showModalFilters}
                        nameModal={'Filtros Cursos'}
                        onClose={() => setShowModalFilters(!showModalFilters)}
                        filters={filters}
                        setFilters={setFilters}
                        culinaristas={culinaristas}
                        clear={() => clearFilters()}
                    />
                }
            </Text>
        </PublicLayout>
    )
}

