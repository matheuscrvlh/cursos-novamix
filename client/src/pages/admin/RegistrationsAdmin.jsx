// react
import { useContext, useState, useEffect } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X, Inbox, RefreshCw, Undo2 } from 'lucide-react';

// Components
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';
import ConfirmModal from '../../components/admin/ModalConfirm';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// SERVICES
import { getSeats, getEnrollment, getTotalEnrollment, putEnrollment, deleteEnrollment, verificarPagamentoMP, reembolsarPagamentoMP } from '../../api/enrollment.services';

// DB
import { DadosContext } from '../../contexts/DadosContext';
import Tooltip from '../../components/admin/Tooltip';

export default function RegistrationsAdmin() {
    // ============== STATES ==============
    // ======= STATE ASSENTOS
    const [ assentos, setAssentos ] = useState([])

    // ======= STATE INSCRICOES
    const [ inscricoesTotais, setInscricoesTotais ] = useState([]);
    const [ loadingInscricoesTotais, setLoadingInscricoesTotais ] = useState(true)
    
    const [ inscricoes, setInscricoes ] = useState([])
    const [ loadingInscricoes, setLoadingInscricoes ] = useState([])

    // ======= STATE MODAL
    const [ step, setStep ] = useState('close')

    // controle de confirmação (exclusão/edição)
    const [ confirm, setConfirm ] = useState(null); // { message, onConfirm }
    // ============== STATES ==============

    const CICLO_STATUS = { pendente: 'pago', pago: 'cancelado', cancelado: 'pendente' };

    // DADOS CONTEXT
    const {
            cursos,
            cursosInfantis = [],
            loading,
            loadingChildren,
        } = useContext(DadosContext);

    const [ verificandoMP, setVerificandoMP ] = useState(null);
    const [ reembolsando, setReembolsando ] = useState(null);
    const [ mensagem, setMensagem ] = useState(null); // { tipo: 'sucesso' | 'erro' | 'info', texto }

    function mostrarMensagem(tipo, texto) {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem(null), 5000);
    }

    // ======= STATE FILTROS - tabela INSCRIÇÕES (topo)
    const [ filtroTipoInsc, setFiltroTipoInsc ] = useState('todos');
    const [ filtroStatusInsc, setFiltroStatusInsc ] = useState('ativos');
    const [ filtroLojaInsc, setFiltroLojaInsc ] = useState('todas');
    const [ filtroPagamentoInsc, setFiltroPagamentoInsc ] = useState('todos');

    // ======= STATE FILTROS - tabela INSCRIÇÕES POR CURSOS (baixo)
    const [ filtroTipo, setFiltroTipo ] = useState('todos');
    const [ filtroStatus, setFiltroStatus ] = useState('ativos');
    const [ filtroLoja, setFiltroLoja ] = useState('todas');

    const hoje = new Date().toISOString().split('T')[0];

    // combina os dois tipos com tag para exibição
    const todosCursos = [
        ...cursos.map(c => ({ ...c, tipo: 'normal' })),
        ...cursosInfantis.map(c => ({ ...c, tipo: 'infantil' })),
    ];

    // filtra as inscrições totais pelos filtros da tabela de cima
    const inscricoesFiltradas = inscricoesTotais.filter(i => {
        const curso = todosCursos.find(c => c.id === i.cursoId);
        if (!curso) return true;
        const passaTipo = filtroTipoInsc === 'normais' ? curso.tipo === 'normal'
                        : filtroTipoInsc === 'infantis' ? curso.tipo === 'infantil'
                        : true;
        const passaStatus = filtroStatusInsc === 'ativos' ? curso.data >= hoje
                          : filtroStatusInsc === 'concluidos' ? curso.data < hoje
                          : true;
        const passaLoja = filtroLojaInsc === 'todas' || curso.loja === filtroLojaInsc;
        const passaPagamento = filtroPagamentoInsc === 'todos' || i.status === filtroPagamentoInsc;
        return passaTipo && passaStatus && passaLoja && passaPagamento;
    });

    const cursosExibidos = todosCursos.filter(c => {
        const passaTipo = filtroTipo === 'normais' ? c.tipo === 'normal'
                        : filtroTipo === 'infantis' ? c.tipo === 'infantil'
                        : true;
        const passaStatus = filtroStatus === 'ativos' ? c.data >= hoje
                          : filtroStatus === 'concluidos' ? c.data < hoje
                          : true;
        const passaLoja = filtroLoja === 'todas' || c.loja === filtroLoja;
        return passaTipo && passaStatus && passaLoja;
    });

    // ============== DELETE ==============
    async function deletarInscricao(inscricaoId) {
        try {
            await deleteEnrollment(inscricaoId)
            
            setInscricoes(prev => 
                prev.filter(inscricao => inscricao.id != inscricaoId)
            );

            setInscricoesTotais(prev => 
                prev.filter(inscricao => inscricao.id != inscricaoId )
            );

        } catch(err) {
            console.log('Erro ao deletar inscrição', err)
        }
    }
    // ============== DELETE ==============

    function statusBadgeClass(status) {
        if (status === 'pago')      return 'bg-green-base';
        if (status === 'pendente')  return 'bg-yellow-500';
        if (status === 'cancelado') return 'bg-gray-base';
        return 'bg-orange-base';
    }

    async function handleVerificarMP(inscricaoId) {
        setVerificandoMP(inscricaoId);
        try {
            const resultado = await verificarPagamentoMP(inscricaoId);

            if (!resultado || resultado.message) {
                mostrarMensagem('erro', resultado?.message || 'Erro ao verificar pagamento. Tente novamente.');
                return;
            }

            const novoStatus = resultado.status;
            setInscricoes(prev =>
                prev.map(i => i.id === inscricaoId ? { ...i, status: novoStatus } : i)
            );
            setInscricoesTotais(prev =>
                prev.map(i => i.id === inscricaoId ? { ...i, status: novoStatus } : i)
            );

            if (novoStatus === 'pago') {
                mostrarMensagem('sucesso', 'Pagamento confirmado no Mercado Pago!');
            } else if (novoStatus === 'cancelado') {
                mostrarMensagem('erro', 'Pagamento recusado/cancelado no Mercado Pago. A vaga foi liberada.');
            } else {
                mostrarMensagem('info', 'Ainda sem confirmação — o pagamento continua pendente no Mercado Pago.');
            }
        } catch (err) {
            console.error('Erro ao verificar pagamento MP:', err);
            mostrarMensagem('erro', 'Erro ao verificar pagamento. Tente novamente.');
        } finally {
            setVerificandoMP(null);
        }
    }

    async function handleReembolsar(inscricaoId) {
        setReembolsando(inscricaoId);
        try {
            const resultado = await reembolsarPagamentoMP(inscricaoId);

            if (!resultado?.ok) {
                mostrarMensagem('erro', resultado?.message || 'Erro ao reembolsar. Tente novamente.');
                return;
            }

            setInscricoes(prev =>
                prev.map(i => i.id === inscricaoId ? { ...i, status: 'cancelado' } : i)
            );
            setInscricoesTotais(prev =>
                prev.map(i => i.id === inscricaoId ? { ...i, status: 'cancelado' } : i)
            );

            mostrarMensagem('sucesso', 'Pagamento reembolsado no Mercado Pago e vaga liberada!');
        } catch (err) {
            console.error('Erro ao reembolsar pagamento MP:', err);
            mostrarMensagem('erro', 'Erro ao reembolsar. Tente novamente.');
        } finally {
            setReembolsando(null);
        }
    }

    // ============== HANDLES ==============
    // ======== INSCRICOES CURSO
    async function handleInscricoesCurso(cursoId) {
        try{
            setStep('inscricoes');

            const assentos = await getSeats(cursoId);
            const inscricoes = await getEnrollment(cursoId);
            setAssentos(assentos);
            setInscricoes(inscricoes);
        
        } catch(err) {
            console.log(err)
        }
    }

    async function handleEditInscricao(inscricaoId) {
        try {
            const inscricaoFiltrada = inscricoes.find(inscricao =>
                inscricao.id === inscricaoId
            )

            const ciclo = { pendente: 'pago', pago: 'cancelado', cancelado: 'pendente' };
            const novoStatus = ciclo[inscricaoFiltrada.status] || 'pendente';

            const inscricaoAlterada = {
                id: inscricaoFiltrada.id,
                cursoId: inscricaoFiltrada.cursoId,
                nome: inscricaoFiltrada.nome,
                cpf: inscricaoFiltrada.cpf,
                celular: inscricaoFiltrada.celular,
                formaPagamento: inscricaoFiltrada.formaPagamento,
                assento: inscricaoFiltrada.assento,
                dataInscricao: inscricaoFiltrada.dataInscricao,
                status: novoStatus
            };

            const resultado = await putEnrollment(inscricaoAlterada.id, inscricaoAlterada);
            if (!resultado?.ok) {
                mostrarMensagem('erro', resultado?.message || 'Erro ao alterar status. Tente novamente.');
                return;
            }

            setInscricoes(prev =>
                prev.map(inscricao =>
                    inscricao.id === inscricaoAlterada.id
                    ? inscricaoAlterada
                    : inscricao
                )
            );

            setInscricoesTotais(prev =>
                prev.map(inscricao =>
                    inscricao.id === inscricaoAlterada.id
                    ? inscricaoAlterada
                    : inscricao
                )
            );
        } catch(err) {
            console.log('Erro ao editar inscricao', err)
            mostrarMensagem('erro', 'Erro ao alterar status. Tente novamente.');
        }
    }

    async function handleEditInscricoesTotais(inscricaoId) {
        try {
            const inscricaoFiltrada = inscricoesTotais.find(inscricao =>
                inscricao.id === inscricaoId
            )

            const ciclo = { pendente: 'pago', pago: 'cancelado', cancelado: 'pendente' };
            const novoStatus = ciclo[inscricaoFiltrada.status] || 'pendente';

            const inscricaoAlterada = {
                id: inscricaoFiltrada.id,
                cursoId: inscricaoFiltrada.cursoId,
                nome: inscricaoFiltrada.nome,
                cpf: inscricaoFiltrada.cpf,
                celular: inscricaoFiltrada.celular,
                formaPagamento: inscricaoFiltrada.formaPagamento,
                assento: inscricaoFiltrada.assento,
                dataInscricao: inscricaoFiltrada.dataInscricao,
                status: novoStatus
            };

            const resultado = await putEnrollment(inscricaoAlterada.id, inscricaoAlterada);
            if (!resultado?.ok) {
                mostrarMensagem('erro', resultado?.message || 'Erro ao alterar status. Tente novamente.');
                return;
            }

            setInscricoesTotais(prev =>
                prev.map(inscricao =>
                    inscricao.id === inscricaoAlterada.id
                    ? inscricaoAlterada
                    : inscricao
                )
            );
        } catch(err) {
            console.log('Erro ao editar inscricao', err)
            mostrarMensagem('erro', 'Erro ao alterar status. Tente novamente.');
        }
    }
    // ============== HANDLES ==============

    // ============== ONLOAD ==============
    useEffect(() => {
            getTotalEnrollment()
            .then(inscricoes => {
                setInscricoesTotais(inscricoes)
            })
            .catch(err => {
                console.log('Erro ao buscar todas inscricoes', err)
            })
            .finally(() => {
                setLoadingInscricoesTotais(false)
            })
        }, [])
    // ============== ONLOAD ==============

    // ============== FUNCOES ==============
    // layout para datas que vieram do input
    function layoutDataInput(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // layout para datas que vieram do sistema
    function layoutDataSistem(data) {
        if(data === undefined) {
            return
        }
        const dataFiltrada = data.split('T')[0];
        const [ano, mes, dia] = dataFiltrada.split('-')
        return `${dia}/${mes}/${ano}`;
    }

    function closeModal() {
        if(step === 'inscricoes') {
            setAssentos([]);
            setInscricoes([]);
            setStep('close');
            return

        } if(step === 'editCourse') {
            setCursoEditar({
                id: '',
                nomeCurso: '',
                data: '',
                hora: '',
                loja: '',
                culinarista: '',
                valor: '',
                duracao: '',
                categoria: '',
                ativo: 'true'
            });

            setStep('close');
            return

        } else {
            setStep('close');
            return
        }
    }

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Inscrições'/>
            <SideBar />
            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Inscrições'} />
                <section className='
                    flex flex-col gap-10 mt-10 w-[92dvw]
                    md:gap-20 lg:w-[78vw]
                '>
                    <CardDash className='bg-white h-full w-full rounded-md p-4 md:p-10 shadow-sm'>
                        <div className='flex flex-col gap-3 mb-4'>
                            <p className='font-bold text-xl text-gray-text'>INSCRIÇÕES</p>
                            <div className='flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2'>

                                {/* Tipo */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-text/50 uppercase tracking-wider w-12 shrink-0 md:hidden'>Tipo</span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {[
                                            { label: 'Todos', value: 'todos' },
                                            { label: 'Cursos', value: 'normais' },
                                            { label: 'Infantis', value: 'infantis' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroTipoInsc(f.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                    filtroTipoInsc === f.value
                                                        ? 'bg-orange-base text-white'
                                                        : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <span className='hidden md:block w-px h-5 bg-gray-base/30' />

                                {/* Status */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-text/50 uppercase tracking-wider w-12 shrink-0 md:hidden'>Status</span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {[
                                            { label: 'Todos', value: 'todos' },
                                            { label: 'Ativos', value: 'ativos' },
                                            { label: 'Concluídos', value: 'concluidos' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroStatusInsc(f.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                    filtroStatusInsc === f.value
                                                        ? 'bg-green-base text-white'
                                                        : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <span className='hidden md:block w-px h-5 bg-gray-base/30' />

                                {/* Loja */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-text/50 uppercase tracking-wider w-12 shrink-0 md:hidden'>Loja</span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {[
                                            { label: 'Todas', value: 'todas' },
                                            { label: 'Prado', value: 'Prado' },
                                            { label: 'Teresópolis', value: 'Teresopolis' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroLojaInsc(f.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                    filtroLojaInsc === f.value
                                                        ? 'bg-blue-base text-white'
                                                        : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <span className='hidden md:block w-px h-5 bg-gray-base/30' />

                                {/* Status pagamento */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-text/50 uppercase tracking-wider w-12 shrink-0 md:hidden'>Pgto</span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {[
                                            { label: 'Todos', value: 'todos' },
                                            { label: 'Pago', value: 'pago' },
                                            { label: 'Pendente', value: 'pendente' },
                                            { label: 'Cancelado', value: 'cancelado' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroPagamentoInsc(f.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                    filtroPagamentoInsc === f.value
                                                        ? 'bg-gray-text text-white'
                                                        : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <hr className='border-gray-base/30 w-full mb-4'/>

                        <div className='max-h-100 overflow-y-auto'>

                            {/* HEADER DESKTOP */}
                            <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>CURSO</p>
                                <p>DATA CURSO</p>
                                <p>NOME</p>
                                <p>ASSENTO</p>
                                <p>STATUS</p>
                                <p>PAGAMENTO</p>
                                <p>FUNÇÕES</p>
                            </div>

                            {loadingInscricoesTotais ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Carregando...</p></div>
                            ) : inscricoesFiltradas.length === 0 ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhuma inscrição encontrada</p></div>
                            ) : inscricoesFiltradas.map(i => {
                                const curso = todosCursos.find(c => c.id === i.cursoId);
                                return (
                                <div key={i.id}>
                                    {/* MOBILE */}
                                    <div className='p-3 text-gray-text md:hidden'>
                                        <div className='flex items-start justify-between gap-2 mb-1'>
                                            <p className='font-semibold text-sm leading-tight flex-1'>{curso?.nomeCurso || i.cursoRemovidoNome || '—'}</p>
                                            {!curso
                                                ? <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-red-base/15 text-red-base'>Curso apagado</span>
                                                : curso?.tipo === 'infantil'
                                                ? <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-green-base/15 text-green-base'>Infantil</span>
                                                : <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-gray-base/15 text-gray-base'>Curso</span>
                                            }
                                        </div>
                                        {!curso && (
                                            <p className='text-xs text-red-base font-medium mb-1'>⚠ O curso desta inscrição foi excluído</p>
                                        )}
                                        <p className='font-medium text-sm text-gray-text'>{i.nome}</p>
                                        <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-text/60 mt-1'>
                                            <span>Assento: {i.assento}</span>
                                            <span>{i.formaPagamento}</span>
                                            {curso?.data && <span>{layoutDataInput(curso.data)}</span>}
                                        </div>
                                        <div className='flex items-center justify-between mt-2'>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${statusBadgeClass(i.status)}`}>
                                                {i.status}
                                            </span>
                                            <div className='flex gap-2'>
                                                {i.formaPagamento === 'mercadopago' && i.status === 'pendente' && (
                                                    <Tooltip label='Verificar no MP'>
                                                        <Button
                                                            className='bg-blue-base p-2 hover:bg-blue-base/80 text-white'
                                                            onClick={() => handleVerificarMP(i.id)}
                                                            disabled={verificandoMP === i.id}
                                                        >
                                                            <RefreshCw size={16} className={verificandoMP === i.id ? 'animate-spin' : ''} />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                {i.formaPagamento === 'mercadopago' && i.status === 'pago' && (
                                                    <Tooltip label='Reembolsar'>
                                                        <Button
                                                            className='bg-gray-text p-2 hover:bg-gray-dark text-white'
                                                            onClick={() => setConfirm({
                                                                title: 'Reembolsar pagamento',
                                                                message: `Reembolsar o pagamento de "${i.nome}" no Mercado Pago? O valor total será devolvido e a vaga será liberada. Essa ação não pode ser desfeita.`,
                                                                variant: 'danger',
                                                                confirmLabel: 'Reembolsar',
                                                                icon: Undo2,
                                                                onConfirm: () => handleReembolsar(i.id)
                                                            })}
                                                            disabled={reembolsando === i.id}
                                                        >
                                                            <Undo2 size={16} className={reembolsando === i.id ? 'animate-spin' : ''} />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                <Tooltip label='Editar status'>
                                                    <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => setConfirm({
                                                title: 'Alterar status',
                                                message: `Alterar status da inscrição de "${i.nome}" para "${CICLO_STATUS[i.status] || 'pendente'}"?`,
                                                variant: 'warning',
                                                confirmLabel: 'Alterar',
                                                onConfirm: () => handleEditInscricoesTotais(i.id)
                                            })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Excluir'>
                                                    <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => setConfirm({
                                        title: 'Excluir inscrição',
                                        message: `Excluir a inscrição de "${i.nome}"?`,
                                        variant: 'danger',
                                        confirmLabel: 'Excluir',
                                        onConfirm: () => deletarInscricao(i.id)
                                    })}>
                                                        <Trash size={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DESKTOP */}
                                    <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-2
                                                    px-3 py-3 items-center text-gray-text text-sm
                                                    hover:bg-gray/60 transition-colors rounded-md'>
                                        <div className='flex items-center gap-2 min-w-0'>
                                            <p className='truncate font-medium' title={!curso ? 'O curso desta inscrição foi excluído' : undefined}>
                                                {curso?.nomeCurso || i.cursoRemovidoNome || '—'}
                                            </p>
                                            {!curso
                                                ? <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-red-base/15 text-red-base' title='O curso desta inscrição foi excluído'>⚠ Curso apagado</span>
                                                : curso?.tipo === 'infantil'
                                                ? <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-green-base/15 text-green-base'>Infantil</span>
                                                : <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-gray-base/15 text-gray-base'>Curso</span>
                                            }
                                        </div>
                                        <p>{curso?.data ? layoutDataInput(curso.data) : '-'}</p>
                                        <p className='truncate'>{i.nome}</p>
                                        <p>{i.assento}</p>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit text-white ${statusBadgeClass(i.status)}`}>
                                            {i.status}
                                        </span>
                                        <p>{i.formaPagamento}</p>
                                        <div className='flex gap-2'>
                                            {i.formaPagamento === 'mercadopago' && i.status === 'pendente' && (
                                                <Tooltip label='Verificar no MP'>
                                                    <Button
                                                        className='bg-blue-base p-2 hover:bg-blue-base/80 text-white'
                                                        onClick={() => handleVerificarMP(i.id)}
                                                        disabled={verificandoMP === i.id}
                                                    >
                                                        <RefreshCw size={16} className={verificandoMP === i.id ? 'animate-spin' : ''} />
                                                    </Button>
                                                </Tooltip>
                                            )}
                                            {i.formaPagamento === 'mercadopago' && i.status === 'pago' && (
                                                <Tooltip label='Reembolsar'>
                                                    <Button
                                                        className='bg-gray-text p-2 hover:bg-gray-dark text-white'
                                                        onClick={() => setConfirm({
                                                            title: 'Reembolsar pagamento',
                                                            message: `Reembolsar o pagamento de "${i.nome}" no Mercado Pago? O valor total será devolvido e a vaga será liberada. Essa ação não pode ser desfeita.`,
                                                            variant: 'danger',
                                                            confirmLabel: 'Reembolsar',
                                                            icon: Undo2,
                                                            onConfirm: () => handleReembolsar(i.id)
                                                        })}
                                                        disabled={reembolsando === i.id}
                                                    >
                                                        <Undo2 size={16} className={reembolsando === i.id ? 'animate-spin' : ''} />
                                                    </Button>
                                                </Tooltip>
                                            )}
                                            <Tooltip label='Editar status'>
                                                <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => setConfirm({
                                                title: 'Alterar status',
                                                message: `Alterar status da inscrição de "${i.nome}" para "${CICLO_STATUS[i.status] || 'pendente'}"?`,
                                                variant: 'warning',
                                                confirmLabel: 'Alterar',
                                                onConfirm: () => handleEditInscricoesTotais(i.id)
                                            })}>
                                                    <Edit size={16} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip label='Excluir'>
                                                <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => setConfirm({
                                        title: 'Excluir inscrição',
                                        message: `Excluir a inscrição de "${i.nome}"?`,
                                        variant: 'danger',
                                        confirmLabel: 'Excluir',
                                        onConfirm: () => deletarInscricao(i.id)
                                    })}>
                                                    <Trash size={16} />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <hr className='border-gray-base/20'/>
                                </div>
                                );
                            })}
                        </div>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-4 md:p-10 shadow-sm'>
                        <div className='flex flex-col gap-3 mb-4'>
                            <p className='font-bold text-xl text-gray-text'>INSCRIÇÕES POR CURSOS</p>
                            <div className='flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2'>

                                {/* Tipo */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-text/50 uppercase tracking-wider w-12 shrink-0 md:hidden'>Tipo</span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {[
                                            { label: 'Todos', value: 'todos' },
                                            { label: 'Cursos', value: 'normais' },
                                            { label: 'Infantis', value: 'infantis' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroTipo(f.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                    filtroTipo === f.value
                                                        ? 'bg-orange-base text-white'
                                                        : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <span className='hidden md:block w-px h-5 bg-gray-base/30' />

                                {/* Status */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-text/50 uppercase tracking-wider w-12 shrink-0 md:hidden'>Status</span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {[
                                            { label: 'Todos', value: 'todos' },
                                            { label: 'Ativos', value: 'ativos' },
                                            { label: 'Concluídos', value: 'concluidos' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroStatus(f.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                    filtroStatus === f.value
                                                        ? 'bg-green-base text-white'
                                                        : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <span className='hidden md:block w-px h-5 bg-gray-base/30' />

                                {/* Loja */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-text/50 uppercase tracking-wider w-12 shrink-0 md:hidden'>Loja</span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {[
                                            { label: 'Todas', value: 'todas' },
                                            { label: 'Prado', value: 'Prado' },
                                            { label: 'Teresópolis', value: 'Teresopolis' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroLoja(f.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                    filtroLoja === f.value
                                                        ? 'bg-blue-base text-white'
                                                        : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <hr className='border-gray-base/30 w-full mb-4'/>

                        <div className='max-h-100 overflow-y-auto'>

                            {/* HEADER DESKTOP */}
                            <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.6fr_0.5fr_0.5fr] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>DESCRIÇÃO</p>
                                <p>CULINARISTA</p>
                                <p>DATA</p>
                                <p>HORARIO</p>
                                <p>TIPO</p>
                                <p>LOJA</p>
                                <p>FUNÇÕES</p>
                            </div>

                            {loading || loadingChildren ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Carregando...</p></div>
                            ) : cursosExibidos.length === 0 ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhum curso encontrado</p></div>
                            ) : (
                                cursosExibidos.map(curso => (
                                    <div key={`${curso.tipo}-${curso.id}`}>
                                        {/* MOBILE */}
                                        <div className='p-3 text-gray-text md:hidden'>
                                            <div className='flex items-start justify-between gap-2 mb-1'>
                                                <p className='font-semibold text-sm leading-tight flex-1'>{curso.nomeCurso}</p>
                                                {curso.tipo === 'infantil'
                                                    ? <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-green-base/15 text-green-base'>Infantil</span>
                                                    : <span className='text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-gray-base/15 text-gray-base'>Curso</span>
                                                }
                                            </div>
                                            <p className='text-xs text-gray-text/60 mb-1'>{curso.culinarista}</p>
                                            <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-text/60'>
                                                <span>{layoutDataInput(curso.data)}</span>
                                                <span>{curso.hora}</span>
                                            </div>
                                            <div className='flex items-center justify-between mt-2'>
                                                {curso.loja === 'Prado'
                                                    ? <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                                    : <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                                }
                                                <Tooltip label='Ver inscrições'>
                                                    <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => handleInscricoesCurso(curso.id)}>
                                                        <Users size={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* DESKTOP */}
                                        <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.6fr_0.5fr_0.5fr] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <p className='font-medium truncate'>{curso.nomeCurso}</p>
                                            <p className='truncate'>{curso.culinarista}</p>
                                            <p>{layoutDataInput(curso.data)}</p>
                                            <p>{curso.hora}</p>
                                            {curso.tipo === 'infantil'
                                                ? <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-green-base/15 text-green-base'>Infantil</span>
                                                : <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-gray-base/15 text-gray-base'>Curso</span>
                                            }
                                            {curso.loja === 'Prado'
                                                ? <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                                : <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                            }
                                            <div className='flex gap-2'>
                                                <Tooltip label='Ver inscrições'>
                                                    <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => handleInscricoesCurso(curso.id)}>
                                                        <Users size={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <hr className='border-gray-base/20'/>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardDash>
                    <Modal
                        width='90%'
                        maxWidth='1200px'
                        height='auto'
                        isOpen={step === 'inscricoes'}
                        onClose={() => closeModal()}
                    >   
                        {/* MOBILE */}
                        <p className='md:hidden text-xl font-bold mb-2 text-gray-text'>INSCRIÇÕES</p>
                        <hr className='md:hidden border-gray-base/30 w-full mb-3'/>
                        <div className='flex md:hidden flex-col gap-2 max-h-[65dvh] overflow-y-auto'>
                            {inscricoes.length === 0
                                ? <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhuma inscrição encontrada</p></div>
                                : inscricoes.map(inscricao => (
                                    <div key={inscricao.id} className='bg-gray rounded-lg p-3'>
                                        {/* Nome + status */}
                                        <div className='flex items-start justify-between gap-2 mb-2'>
                                            <p className='font-semibold text-gray-text text-sm'>{inscricao.nome}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 text-white ${statusBadgeClass(inscricao.status)}`}>
                                                {inscricao.status}
                                            </span>
                                        </div>
                                        {/* Infos em grid */}
                                        <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-text/70 mb-3'>
                                            <span><span className='font-medium text-gray-text'>Assento </span>{inscricao.assento}</span>
                                            <span><span className='font-medium text-gray-text'>CPF </span>{inscricao.cpf}</span>
                                            <span><span className='font-medium text-gray-text'>Celular </span>{inscricao.celular}</span>
                                            <span><span className='font-medium text-gray-text'>Pagamento </span>{inscricao.formaPagamento}</span>
                                            <span className='col-span-2'><span className='font-medium text-gray-text'>Inscrição </span>{layoutDataSistem(inscricao.dataInscricao)}</span>
                                        </div>
                                        {/* Ações */}
                                        <div className='flex gap-2'>
                                            {inscricao.formaPagamento === 'mercadopago' && inscricao.status === 'pendente' && (
                                                <Button
                                                    className='bg-blue-base p-2 hover:bg-blue-base/80 text-white rounded-md'
                                                    onClick={() => handleVerificarMP(inscricao.id)}
                                                    disabled={verificandoMP === inscricao.id}
                                                >
                                                    <RefreshCw size={16} className={verificandoMP === inscricao.id ? 'animate-spin' : ''} />
                                                </Button>
                                            )}
                                            {inscricao.formaPagamento === 'mercadopago' && inscricao.status === 'pago' && (
                                                <Button
                                                    className='bg-gray-text p-2 hover:bg-gray-dark text-white rounded-md'
                                                    onClick={() => setConfirm({
                                                        title: 'Reembolsar pagamento',
                                                        message: `Reembolsar o pagamento de "${inscricao.nome}" no Mercado Pago? O valor total será devolvido e a vaga será liberada. Essa ação não pode ser desfeita.`,
                                                        variant: 'danger',
                                                        confirmLabel: 'Reembolsar',
                                                        icon: Undo2,
                                                        onConfirm: () => handleReembolsar(inscricao.id)
                                                    })}
                                                    disabled={reembolsando === inscricao.id}
                                                >
                                                    <Undo2 size={16} className={reembolsando === inscricao.id ? 'animate-spin' : ''} />
                                                </Button>
                                            )}
                                            <Button
                                                className='flex-1 bg-orange-base py-2 hover:bg-orange-light text-white text-xs font-semibold flex items-center justify-center gap-1 rounded-md'
                                                onClick={() => setConfirm({
                                                title: 'Alterar status',
                                                message: `Alterar status da inscrição de "${inscricao.nome}" para "${CICLO_STATUS[inscricao.status] || 'pendente'}"?`,
                                                variant: 'warning',
                                                confirmLabel: 'Alterar',
                                                onConfirm: () => handleEditInscricao(inscricao.id)
                                            })}
                                            >
                                                <Edit size={14} /> Alterar status
                                            </Button>
                                            <Button
                                                className='bg-red-base p-2 hover:bg-red-light text-white rounded-md'
                                                onClick={() => setConfirm({
                                                title: 'Excluir inscrição',
                                                message: `Excluir a inscrição de "${inscricao.nome}"?`,
                                                variant: 'danger',
                                                confirmLabel: 'Excluir',
                                                onConfirm: () => deletarInscricao(inscricao.id)
                                            })}
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        {/* DESKTOP */}
                        <div className='hidden md:block max-h-100 overflow-y-auto'>

                            {/* HEADER */}
                            <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>ASSENTO</p>
                                <p>NOME</p>
                                <p>CPF</p>
                                <p>CELULAR</p>
                                <p>PAGAMENTO</p>
                                <p>STATUS</p>
                                <p>INSCRICAO</p>
                                <p>FUNÇÕES</p>
                            </div>

                            {inscricoes.length === 0
                                ? <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhuma inscrição encontrada</p></div>
                                : inscricoes.map(inscricao => (
                                    <div key={inscricao.id}>
                                        <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <p>{inscricao.assento}</p>
                                            <p className='truncate'>{inscricao.nome}</p>
                                            <p>{inscricao.cpf}</p>
                                            <p>{inscricao.celular}</p>
                                            <p>{inscricao.formaPagamento}</p>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit text-white ${statusBadgeClass(inscricao.status)}`}>
                                                {inscricao.status}
                                            </span>
                                            <p>{layoutDataSistem(inscricao.dataInscricao)}</p>
                                            <div className='flex gap-2'>
                                                {inscricao.formaPagamento === 'mercadopago' && inscricao.status === 'pendente' && (
                                                    <Tooltip label='Verificar no MP'>
                                                        <Button
                                                            className='bg-blue-base p-2 hover:bg-blue-base/80 text-white'
                                                            onClick={() => handleVerificarMP(inscricao.id)}
                                                            disabled={verificandoMP === inscricao.id}
                                                        >
                                                            <RefreshCw size={16} className={verificandoMP === inscricao.id ? 'animate-spin' : ''} />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                {inscricao.formaPagamento === 'mercadopago' && inscricao.status === 'pago' && (
                                                    <Tooltip label='Reembolsar'>
                                                        <Button
                                                            className='bg-gray-text p-2 hover:bg-gray-dark text-white'
                                                            onClick={() => setConfirm({
                                                                title: 'Reembolsar pagamento',
                                                                message: `Reembolsar o pagamento de "${inscricao.nome}" no Mercado Pago? O valor total será devolvido e a vaga será liberada. Essa ação não pode ser desfeita.`,
                                                                variant: 'danger',
                                                                confirmLabel: 'Reembolsar',
                                                                icon: Undo2,
                                                                onConfirm: () => handleReembolsar(inscricao.id)
                                                            })}
                                                            disabled={reembolsando === inscricao.id}
                                                        >
                                                            <Undo2 size={16} className={reembolsando === inscricao.id ? 'animate-spin' : ''} />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                <Tooltip label='Editar status'>
                                                    <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => setConfirm({
                                                title: 'Alterar status',
                                                message: `Alterar status da inscrição de "${inscricao.nome}" para "${CICLO_STATUS[inscricao.status] || 'pendente'}"?`,
                                                variant: 'warning',
                                                confirmLabel: 'Alterar',
                                                onConfirm: () => handleEditInscricao(inscricao.id)
                                            })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Excluir'>
                                                    <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => setConfirm({
                                                title: 'Excluir inscrição',
                                                message: `Excluir a inscrição de "${inscricao.nome}"?`,
                                                variant: 'danger',
                                                confirmLabel: 'Excluir',
                                                onConfirm: () => deletarInscricao(inscricao.id)
                                            })}>
                                                        <Trash size={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <hr className='border-gray-base/20'/>
                                    </div>
                                ))
                            }
                        </div>
                    </Modal>

                    {mensagem && (
                        <div
                            className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-white cursor-pointer ${
                                mensagem.tipo === 'sucesso' ? 'bg-green-base'
                                : mensagem.tipo === 'erro'   ? 'bg-red-base'
                                : 'bg-blue-base'
                            }`}
                            onClick={() => setMensagem(null)}
                        >
                            {mensagem.texto}
                        </div>
                    )}

                    <ConfirmModal
                        isOpen={!!confirm}
                        title={confirm?.title || 'Confirmação'}
                        message={confirm?.message}
                        variant={confirm?.variant}
                        confirmLabel={confirm?.confirmLabel}
                        icon={confirm?.icon}
                        onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
                        onCancel={() => setConfirm(null)}
                    />
                </section>
            </main>
        </div>
    )
}