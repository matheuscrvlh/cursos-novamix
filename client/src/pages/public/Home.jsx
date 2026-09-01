import { useContext, useState, useEffect, useRef } from 'react';
import { Loader2, XCircle } from 'lucide-react';

import { DadosContext } from '../../contexts/DadosContext';
import { ClienteAuthContext } from '../../contexts/ClienteAuthContext';

import { postEnrollment, putSeatChange, getSeats, cancelEnrollment } from '../../api/enrollment.services';

import { useThemeColor } from '../../hooks/useThemeColor';

import ModalLoginRequired from '../../components/public/enrollment/ModalLoginRequired';
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats';
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess';
import ModalEnrollmentPayment from '../../components/public/enrollment/ModalEnrollmentPayment';

import CoursesSections from '../../sections/home/CoursesSections';
import CategoriesSections from '../../sections/home/CategoriesSections';
import ChildrensCoursesSections from '../../sections/home/ChildrensCoursesSections';
import CulinariansSections from '../../sections/home/CulinariansSections';
import IndustriesSections from '../../sections/home/IndustriesSections';
import LocationSections from '../../sections/home/LocationSections';

import PublicLayout from '../../layouts/public/PublicLayout'

import { Head } from '../../components/Head'
import { cursoEncerrado } from '../../utils/formatDate'

import { bannerHome } from '../../assets/images/banner/'

export default function Home() {

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
    const { cliente } = useContext(ClienteAuthContext);

    const [enrollment, setEnrollment] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        celular: '',
        email: '',
        assento: ''
    });

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

    const [cursosAtuais, setCursosAtuais] = useState([]);
    const [cursosFiltrados, setCursosFiltrados] = useState([]);

    const [cursosInfantisAtuais, setCursosInfantisAtuais] = useState([]);
    const [cursosInfantisFiltrados, setCursosInfantisFiltrados] = useState([]);

    const [loadingVagasPorCurso, setLoadingVagasPorCurso] = useState(true);
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    const [loadingVagasPorCursoInfantis, setLoadingVagasPorCursoInfantis] = useState(true);
    const [vagasPorCursoInfantil, setVagasPorCursoInfantil] = useState({});
    const [refreshVagasInfantis, setRefreshVagasInfantis] = useState(0);

    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [assentos, setAssentos] = useState([]);

    const [step, setStep] = useState(null)
    const [loadingPagamento, setLoadingPagamento] = useState(false)
    const [erroPagamento, setErroPagamento] = useState(null)
    const [inscricaoAtiva, setInscricaoAtiva] = useState(null)
    const [assentoAtual, setAssentoAtual] = useState(null)
    const [payerEmail, setPayerEmail] = useState(null)
    const [pagamentoAprovado, setPagamentoAprovado] = useState(true)

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

    async function handleSubmitCourse() {
        setStep(null)
        setLoadingPagamento(true)
        setErroPagamento(null)

        try {
            // já existe inscrição ativa: está só trocando de assento, não criando outra
            if (inscricaoAtiva) {
                const resultado = await putSeatChange(inscricaoAtiva, enrollment.assento);
                if (!resultado?.ok) {
                    setErroPagamento(resultado?.message || 'Não foi possível trocar de assento. Tente novamente.');
                    setStep('assento');
                    return;
                }
                setAssentoAtual(enrollment.assento);
                setStep('pagamento');
                return;
            }

            const res = await postEnrollment({
                cursoId: enrollment.cursoId,
                nome: enrollment.nome,
                cpf: enrollment.cpf,
                celular: enrollment.celular,
                email: enrollment.email,
                assento: enrollment.assento
            });

            if (!res || res.message) {
                setErroPagamento(res?.message || 'Erro ao criar inscrição. Tente novamente.');
                return;
            }

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'form_submit_success', form_name: 'cadastro_curso' });

            setPayerEmail(enrollment.email)
            setEnrollment(prev => ({ ...prev, nome: '', cpf: '', celular: '', email: '' }));

            setAssentoAtual(res.assento)
            setInscricaoAtiva(res.id)
            setStep('pagamento')
        } catch (err) {
            console.error(err);
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

    useEffect(() => {
        const cursosFiltrados = cursos
            .filter(c => !cursoEncerrado(c))
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        setCursosAtuais(cursosFiltrados);
    }, [cursos]);

    useEffect(() => {
            const filtrados = cursosAtuais
                .filter(c =>  !filtersCourses.dataInicial || new Date(c.data) >= new Date(filtersCourses.dataInicial) )
                .filter(c => !filtersCourses.dataFinal || new Date(c.data) <= new Date(filtersCourses.dataFinal) )
                .filter(c => !filtersCourses.loja || c.loja === filtersCourses.loja )
                .filter(c => !filtersCourses.culinarista || c.culinarista === filtersCourses.culinarista)
            setCursosFiltrados(filtrados)
    }, [filtersCourses, cursosAtuais])

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

    useEffect(() => {
        const cursosFiltrados = cursosInfantis
            .filter(c => !cursoEncerrado(c))
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        setCursosInfantisAtuais(cursosFiltrados);
    }, [cursosInfantis]);

    useEffect(() => {
            const filtrados = cursosInfantisAtuais
                .filter(c =>  !filtersChildrensCourses.dataInicial || new Date(c.data) >= new Date(filtersChildrensCourses.dataInicial) )
                .filter(c => !filtersChildrensCourses.dataFinal || new Date(c.data) <= new Date(filtersChildrensCourses.dataFinal) )
                .filter(c => !filtersChildrensCourses.loja || c.loja === filtersChildrensCourses.loja )
                .filter(c => !filtersChildrensCourses.culinarista || c.culinarista === filtersChildrensCourses.culinarista)
            setCursosInfantisFiltrados(filtrados)
    }, [filtersChildrensCourses, cursosInfantisAtuais])


    // sem conta, não dá pra saber os dados de quem tá se inscrevendo — manda
    // pro login/cadastro em vez de pedir os dados manualmente aqui
    const openForm = (cursoId) => {
        if (!cliente) {
            setStep('loginRequired')
            return
        }
        setEnrollment(prev => ({
            ...prev,
            cursoId,
            nome: cliente.nome || '',
            cpf: cliente.cpf || '',
            celular: cliente.celular || '',
            email: cliente.email || '',
        }))
        setCursoSelecionado(cursoId)
        setStep('assento')
    }

    // Fecha o modal e, se havia uma inscrição pendente em aberto (cliente
    // desistiu no meio do pagamento), cancela ela e libera o assento na hora
    const closeModal = async () => {
        if (inscricaoAtiva) {
            try { await cancelEnrollment(inscricaoAtiva) } catch (err) { console.error(err) }
        }
        setStep(null)
        setEnrollment({ cursoId: '', nome: '', cpf: '', celular: '', email: '', assento: '' })
        setCursoSelecionado('')
        setInscricaoAtiva(null)
        setAssentoAtual(null)
        setPayerEmail(null)
        setRefreshVagas(prev => prev + 1);
        setRefreshVagasInfantis(prev => prev + 1);
    }

    // loja de preferência vem da conta (perguntada no cadastro) — só define
    // o filtro inicial, o cliente pode trocar normalmente pelos filtros
    useEffect(() => {
        if (!cliente?.loja) return
        setFiltersCourses(prev => ({ ...prev, loja: cliente.loja }))
        setFiltersChildrensCourses(prev => ({ ...prev, loja: cliente.loja }))
    }, [cliente])

    useThemeColor('#FF8D0A');

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head />
            <section className='bg-gray mb-20'>

                <CoursesSections
                    cursosFiltrados={cursosFiltrados}
                    loadingCourses={loadingCourses}
                    loadingVagasPorCurso={loadingVagasPorCurso}
                    vagasPorCurso={vagasPorCurso}
                    openForm={openForm}
                />

                <CategoriesSections />

                {cursosInfantisFiltrados.length === 0
                    ? ''
                    : <ChildrensCoursesSections
                        cursosInfantisFiltrados={cursosInfantisFiltrados}
                        loadingChildren={loadingChildren}
                        loadingVagasPorCursoInfantis={loadingVagasPorCursoInfantis}
                        vagasPorCursoInfantil={vagasPorCursoInfantil}
                        openForm={openForm}
                    />
                }

                <CulinariansSections
                    culinaristas={culinaristas}
                    loadingCulinarian={loadingCulinarian}
                />

                {industrias.length === 0
                    ? ''
                    :<IndustriesSections
                        industrias={industrias}
                        loadingIndustries={loadingIndustries}
                    />
                }

                <LocationSections/>

                <ModalLoginRequired
                    isOpen={step === 'loginRequired'}
                    onClose={() => closeModal()}
                />

                <ModalEnrollmentSeats
                    isOpen={step === 'assento'}
                    onClick={handleSubmitCourse}
                    onClose={closeModal}
                    enrollment={enrollment}
                    setEnrollment={setEnrollment}
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
