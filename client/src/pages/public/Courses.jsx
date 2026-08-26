import { useContext, useState, useEffect, useRef } from 'react';

import { Menu, Loader2, XCircle } from 'lucide-react'

import { DadosContext } from '../../contexts/DadosContext';
import { ClienteAuthContext } from '../../contexts/ClienteAuthContext';

import { postEnrollment, putSeatChange, getSeats, cancelEnrollment } from '../../api/enrollment.services';

import { useThemeColor } from '../../hooks/useThemeColor';

import ModalFilters from '../../components/public/ModalFilters';
import ModalLoginRequired from '../../components/public/enrollment/ModalLoginRequired';
import ModalEnrollmentSeats from '../../components/public/enrollment/ModalEnrollmentSeats';
import ModalEnrollmentSucess from '../../components/public/enrollment/ModalEnrollmentSucess';
import ModalEnrollmentPayment from '../../components/public/enrollment/ModalEnrollmentPayment';

import AllCoursesSections from '../../sections/courses/AllCoursesSections';

import PublicLayout from '../../layouts/public/PublicLayout'

import { Head } from '../../components/Head'
import { cursoEncerrado } from '../../utils/formatDate'

import { bannerHome } from '../../assets/images/banner/'

export default function Courses() {

    const {
        cursos,
        loadingCourses,
        culinaristas,
    } = useContext(DadosContext);
    const { cliente } = useContext(ClienteAuthContext);

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

    // refaz a busca de assentos toda vez que a tela de seleção abre (não só na
    // primeira vez que o curso é selecionado) — sem isso, quem demora no
    // formulário (ou tenta de novo depois de um erro) reusa a mesma lista de
    // assentos desatualizada, podendo escolher um assento já ocupado em loop
    useEffect(() => {
        if (!cursoSelecionado || step !== 'assento') {
            return
        }

        getSeats(cursoSelecionado)
            .then(setAssentos)
            .catch(console.error)
    }, [cursoSelecionado, step])

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

    useEffect(() => {
        const cursosFiltrados = cursos
            .filter(c => !cursoEncerrado(c))
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        setCursosAtuais(cursosFiltrados);
    }, [cursos]);

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

    // sem conta, não dá pra saber os dados de quem tá se inscrevendo — manda
    // pro login/cadastro em vez de pedir os dados manualmente aqui
    const openForm = (cursoId) => {
        if (!cliente) {
            setStep('loginRequired')
            return
        }
        setForm(prev => ({
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
        setForm({ cursoId: '', nome: '', cpf: '', celular: '', email: '', assento: '' })
        setCursoSelecionado('')
        setInscricaoAtiva(null)
        setAssentoAtual(null)
        setPayerEmail(null)
        setRefreshVagas(prev => prev + 1);
    }

    // loja de preferência vem da conta (perguntada no cadastro) — só define
    // o filtro inicial, o cliente pode trocar normalmente pelos filtros
    useEffect(() => {
        if (!cliente?.loja) return
        setFilters(prev => ({ ...prev, loja: cliente.loja }))
    }, [cliente])

    useThemeColor('#FF8D0A');

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <section className='bg-gray mb-20'>

                <AllCoursesSections
                    cursosFiltrados={cursosFiltrados}
                    loadingCourses={loadingCourses}
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

                <ModalLoginRequired
                    isOpen={step === 'loginRequired'}
                    onClose={() => closeModal()}
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
