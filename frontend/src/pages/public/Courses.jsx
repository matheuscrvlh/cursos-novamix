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
import ModalBranch from '../../components/public/ModalBranch';
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

    // ========= FUNCOES  =========
    // =========  FUNCOES CADASTRO CLIENTE =========
    async function handleSubmit() {
        const inscricao = await postEnrollment({
            cursoId: form.cursoId,
            nome: form.nome,
            cpf: form.cpf,
            celular: form.celular,
            formaPagamento: form.formaPagamento,
            assento: form.assento
        });

        if (!inscricao || inscricao.message) {
            alert(inscricao?.message || 'Erro ao criar inscrição');
            return;
        }

        const formaPagamento = form.formaPagamento;
        setForm({ cursoId: '', nome: '', cpf: '', celular: '', formaPagamento: 'mercadopago', assento: '' });

        if (formaPagamento === 'mercadopago') {
            const res = await fetch('/api/pagamentos/criar-preferencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inscricaoId: inscricao.id }),
            });
            const { checkout_url } = await res.json();
            if (checkout_url) {
                window.location.href = checkout_url;
            } else {
                alert('Erro ao gerar link de pagamento. Tente novamente.');
            }
        } else {
            setStep('confirmacao');
        }

        setRefreshVagas(prev => prev + 1);
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
        setForm({ cursoId: '', nome: '', cpf: '', celular: '', formaPagamento: 'mercadopago', assento: '' })
        setCursoSelecionado('')
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
                />

                {/* ======== MODAL SUCESS ======== */}
                <ModalEnrollmentSucess
                    isOpen={step === 'confirmacao'}
                    onClick={() => closeModal()}
                    onClose={closeModal}
                />

            </section>
        </PublicLayout>
    )
}

