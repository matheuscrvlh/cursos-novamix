import { useContext, useEffect, useState } from 'react';
import { Trash, Users, Inbox, RefreshCw, Undo2, Search } from 'lucide-react';

import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';
import ConfirmModal from '../../components/admin/ModalConfirm';
import FilterPills from '../../components/admin/FilterPills';
import Tooltip from '../../components/admin/Tooltip';
import AdminPage from '../../layouts/admin/AdminPage';

import { getEnrollment, getTotalEnrollment, deleteEnrollment, verificarPagamentoMP, reembolsarPagamentoMP } from '../../api/enrollment.services';

import { DadosContext } from '../../contexts/DadosContext';
import useConfirmAction from '../../hooks/useConfirmAction';
import { formatDateBR, formatDateTimeBR } from '../../utils/formatDate';

const FILTROS_TIPO = [
    { label: 'Todos', value: 'todos' },
    { label: 'Cursos', value: 'normais' },
    { label: 'Infantis', value: 'infantis' },
];

const FILTROS_STATUS = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativos' },
    { label: 'Concluídos', value: 'concluidos' },
];

const FILTROS_LOJA = [
    { label: 'Todas', value: 'todas', activeClass: 'bg-gray-text text-white' },
    { label: 'Prado', value: 'Prado', activeClass: 'bg-orange-base text-white' },
    { label: 'Teresópolis', value: 'Teresopolis', activeClass: 'bg-blue-base text-white' },
];

const FILTROS_PAGAMENTO = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pago', value: 'pago' },
    { label: 'Pendente', value: 'pendente' },
    { label: 'Cancelado', value: 'cancelado' },
    { label: 'Recusado', value: 'recusado' },
    { label: 'Reembolsado', value: 'reembolsado' },
];

const FILTROS_DATA = [
    { label: 'Hoje', value: 'hoje' },
    { label: 'Ontem', value: 'ontem' },
    { label: 'Essa semana', value: 'semana' },
];

// todas as comparações usam o horário local do navegador — dataInscricao vem
// em ISO UTC (new Date().toISOString() no backend), e o construtor Date já
// converte pra hora local sozinho, então não precisa de nenhum ajuste manual
function inicioDoDia(data) {
    // "YYYY-MM-DD" (valor de <input type="date">) precisa ser montado como
    // data local manualmente — new Date("YYYY-MM-DD") interpreta como UTC
    // meia-noite, o que em fusos negativos (Brasil) vira o dia anterior local
    if (typeof data === 'string') {
        const [ano, mes, dia] = data.split('-').map(Number);
        return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
    }
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
}

function inicioDaSemana() {
    const d = inicioDoDia(new Date());
    d.setDate(d.getDate() - d.getDay()); // volta até domingo
    return d;
}

function passaFiltroData(dataInscricaoISO, filtro, periodoInicio, periodoFim) {
    const dataInsc = new Date(dataInscricaoISO);
    if (Number.isNaN(dataInsc.getTime())) return true;

    if (filtro === 'hoje') {
        return dataInsc >= inicioDoDia(new Date());
    }
    if (filtro === 'ontem') {
        const inicioOntem = inicioDoDia(new Date());
        inicioOntem.setDate(inicioOntem.getDate() - 1);
        return dataInsc >= inicioOntem && dataInsc < inicioDoDia(new Date());
    }
    if (filtro === 'semana') {
        return dataInsc >= inicioDaSemana();
    }
    if (filtro === 'periodo') {
        if (periodoInicio && dataInsc < inicioDoDia(periodoInicio)) return false;
        if (periodoFim) {
            const fim = inicioDoDia(periodoFim);
            fim.setDate(fim.getDate() + 1); // inclui o dia final inteiro
            if (dataInsc >= fim) return false;
        }
        return true;
    }
    return true;
}

function statusBadgeClass(status) {
    if (status === 'pago')        return 'bg-green-base';
    if (status === 'pendente')    return 'bg-yellow-500';
    if (status === 'cancelado')   return 'bg-gray-base';
    if (status === 'recusado')    return 'bg-red-light';
    if (status === 'reembolsado') return 'bg-red-base';
    return 'bg-orange-base';
}

// metodoPagamento só é preenchido depois que o cliente escolhe Pix ou cartão
// no Brick — antes disso (inscrição recém-criada) ainda não existe
function metodoPagamentoLabel(metodo) {
    if (metodo === 'pix')    return 'Pix';
    if (metodo === 'cartao') return 'Cartão';
    return '—';
}

// Reembolso só faz sentido enquanto o curso ainda não rolou e com pelo menos
// 24h de antecedência do início — depois disso, o Mercado Pago ainda aceitaria
// o reembolso, mas não faz sentido devolver o dinheiro de um curso que já vai
// acontecer/aconteceu em menos de um dia.
function podeReembolsar(curso) {
    if (!curso?.data) return false;
    const inicioCurso = new Date(`${curso.data}T${curso.hora || '00:00'}`);
    const limiteReembolso = new Date(inicioCurso.getTime() - 24 * 60 * 60 * 1000);
    return new Date() < limiteReembolso;
}

function InscricaoAcoes({ inscricao, curso, verificandoMP, reembolsando, onVerificarMP, onReembolsar, onExcluir }) {
    return (
        <>
            {inscricao.formaPagamento === 'mercadopago' && inscricao.status === 'pendente' && (
                <Tooltip label='Verificar no MP'>
                    <Button
                        className='bg-blue-base p-2 hover:bg-blue-base/80 text-white'
                        onClick={onVerificarMP}
                        disabled={verificandoMP}
                    >
                        <RefreshCw size={16} className={verificandoMP ? 'animate-spin' : ''} />
                    </Button>
                </Tooltip>
            )}
            {inscricao.formaPagamento === 'mercadopago' && inscricao.status === 'pago' && podeReembolsar(curso) && (
                <Tooltip label='Reembolsar'>
                    <Button
                        className='bg-gray-text p-2 hover:bg-gray-dark text-white'
                        onClick={onReembolsar}
                        disabled={reembolsando}
                    >
                        <Undo2 size={16} className={reembolsando ? 'animate-spin' : ''} />
                    </Button>
                </Tooltip>
            )}
            <Tooltip label='Excluir'>
                <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={onExcluir}>
                    <Trash size={16} />
                </Button>
            </Tooltip>
        </>
    )
}

export default function RegistrationsAdmin() {
    const [inscricoesTotais, setInscricoesTotais] = useState([]);
    const [loadingInscricoesTotais, setLoadingInscricoesTotais] = useState(true)

    const [inscricoes, setInscricoes] = useState([])

    const [step, setStep] = useState('close')
    const [cursoSelecionado, setCursoSelecionado] = useState(null)

    const { confirm, ask, handleConfirm, handleCancel } = useConfirmAction();

    const {
            cursos,
            cursosInfantis = [],
            loadingCourses,
            loadingChildren,
        } = useContext(DadosContext);

    const [verificandoMP, setVerificandoMP] = useState(null);
    const [reembolsando, setReembolsando] = useState(null);
    const [mensagem, setMensagem] = useState(null);

    function mostrarMensagem(tipo, texto) {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem(null), 5000);
    }

    const [filtroTipoInsc, setFiltroTipoInsc] = useState('todos');
    const [filtroStatusInsc, setFiltroStatusInsc] = useState('ativos');
    const [filtroLojaInsc, setFiltroLojaInsc] = useState('todas');
    const [filtroPagamentoInsc, setFiltroPagamentoInsc] = useState('todos');
    const [filtroDataInsc, setFiltroDataInsc] = useState('hoje');
    const [periodoInicio, setPeriodoInicio] = useState('');
    const [periodoFim, setPeriodoFim] = useState('');
    const [buscaCliente, setBuscaCliente] = useState('');

    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroStatus, setFiltroStatus] = useState('ativos');
    const [filtroLoja, setFiltroLoja] = useState('todas');

    // usa componentes locais (não toISOString, que é UTC) — perto da meia-noite
    // isso pode acusar o dia errado dependendo do fuso do navegador
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

    function selecionarPeriodo(campo, valor) {
        if (campo === 'inicio') setPeriodoInicio(valor); else setPeriodoFim(valor);
        setFiltroDataInsc('periodo');
    }

    function selecionarFiltroDataRapido(valor) {
        setFiltroDataInsc(valor);
        setPeriodoInicio('');
        setPeriodoFim('');
    }

    const todosCursos = [
        ...cursos.map(c => ({ ...c, tipo: 'normal' })),
        ...cursosInfantis.map(c => ({ ...c, tipo: 'infantil' })),
    ].sort((a, b) => new Date(`${a.data}T${a.hora || '00:00'}`) - new Date(`${b.data}T${b.hora || '00:00'}`));

    const cursoModal = todosCursos.find(c => c.id === cursoSelecionado);

    const inscricoesFiltradas = inscricoesTotais.filter(i => {
        // busca por nome (texto) ou CPF (dígitos) — só compara dígitos de CPF
        // quando a busca de fato tiver algum dígito, senão "123".includes('')
        // seria sempre verdadeiro e a busca por nome deixaria de filtrar nada
        const queryDigits = buscaCliente.replace(/\D/g, '');
        const queryLower = buscaCliente.trim().toLowerCase();
        const passaBusca = !queryLower
            || (i.nome || '').toLowerCase().includes(queryLower)
            || (queryDigits.length > 0 && (i.cpf || '').replace(/\D/g, '').includes(queryDigits));

        const curso = todosCursos.find(c => c.id === i.cursoId);
        if (!curso) return passaBusca;

        const passaTipo = filtroTipoInsc === 'normais' ? curso.tipo === 'normal'
                        : filtroTipoInsc === 'infantis' ? curso.tipo === 'infantil'
                        : true;
        const passaStatus = filtroStatusInsc === 'ativos' ? curso.data >= hoje
                          : filtroStatusInsc === 'concluidos' ? curso.data < hoje
                          : true;
        const passaLoja = filtroLojaInsc === 'todas' || curso.loja === filtroLojaInsc;
        const passaPagamento = filtroPagamentoInsc === 'todos' || i.status === filtroPagamentoInsc;
        const passaData = passaFiltroData(i.dataInscricao, filtroDataInsc, periodoInicio, periodoFim);
        return passaTipo && passaStatus && passaLoja && passaPagamento && passaData && passaBusca;
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

    async function deletarInscricao(inscricaoId) {
        try {
            const resultado = await deleteEnrollment(inscricaoId)
            if (!resultado?.ok) {
                alert(resultado?.message || 'Erro ao excluir inscrição.')
                return
            }

            setInscricoes(prev => prev.filter(inscricao => inscricao.id != inscricaoId));
            setInscricoesTotais(prev => prev.filter(inscricao => inscricao.id != inscricaoId));

        } catch(err) {
            console.log('Erro ao deletar inscrição', err)
            alert('Erro ao excluir inscrição.')
        }
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
            setInscricoes(prev => prev.map(i => i.id === inscricaoId ? { ...i, status: novoStatus } : i));
            setInscricoesTotais(prev => prev.map(i => i.id === inscricaoId ? { ...i, status: novoStatus } : i));

            if (novoStatus === 'pago') {
                mostrarMensagem('sucesso', 'Pagamento confirmado no Mercado Pago!');
            } else if (novoStatus === 'recusado') {
                mostrarMensagem('erro', 'Pagamento recusado pela operadora/banco. A vaga foi liberada.');
            } else if (novoStatus === 'cancelado') {
                mostrarMensagem('erro', 'Pagamento cancelado no Mercado Pago. A vaga foi liberada.');
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

            setInscricoes(prev => prev.map(i => i.id === inscricaoId ? { ...i, status: 'reembolsado' } : i));
            setInscricoesTotais(prev => prev.map(i => i.id === inscricaoId ? { ...i, status: 'reembolsado' } : i));

            mostrarMensagem('sucesso', 'Pagamento reembolsado no Mercado Pago e vaga liberada!');
        } catch (err) {
            console.error('Erro ao reembolsar pagamento MP:', err);
            mostrarMensagem('erro', 'Erro ao reembolsar. Tente novamente.');
        } finally {
            setReembolsando(null);
        }
    }

    async function handleInscricoesCurso(cursoId) {
        try {
            setStep('inscricoes');
            setCursoSelecionado(cursoId);

            const inscricoes = await getEnrollment(cursoId);
            setInscricoes(inscricoes);

        } catch(err) {
            console.log(err)
        }
    }

    function closeModal() {
        setInscricoes([]);
        setCursoSelecionado(null);
        setStep('close');
    }

    function confirmarExclusao(inscricao) {
        ask({
            title: 'Excluir inscrição',
            message: `Excluir a inscrição de "${inscricao.nome}"?`,
            variant: 'danger',
            confirmLabel: 'Excluir',
            onConfirm: () => deletarInscricao(inscricao.id)
        })
    }

    function confirmarReembolso(inscricao) {
        ask({
            title: 'Reembolsar pagamento',
            message: `Reembolsar o pagamento de "${inscricao.nome}" no Mercado Pago? O valor total será devolvido e a vaga será liberada. Essa ação não pode ser desfeita.`,
            variant: 'danger',
            confirmLabel: 'Reembolsar',
            icon: Undo2,
            onConfirm: () => handleReembolsar(inscricao.id)
        })
    }

    useEffect(() => {
        getTotalEnrollment()
            .then(inscricoes => setInscricoesTotais(inscricoes))
            .catch(err => console.log('Erro ao buscar todas inscricoes', err))
            .finally(() => setLoadingInscricoesTotais(false))
    }, []);

    return (
        <AdminPage title='Inscrições'>
            <CardDash className='bg-white h-full w-full rounded-md p-4 md:p-10 shadow-sm'>
                <div className='flex flex-col gap-3 mb-4'>
                    <p className='font-bold text-xl text-gray-text'>INSCRIÇÕES</p>
                    <div className='relative w-full md:max-w-xs'>
                        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-text/40' />
                        <input
                            type='text'
                            placeholder='Buscar por nome ou CPF'
                            value={buscaCliente}
                            onChange={e => setBuscaCliente(e.target.value)}
                            className='w-full text-sm border border-gray-base/30 rounded-md pl-9 pr-3 py-2 text-gray-text outline-none focus:border-orange-base'
                        />
                    </div>
                    <div className='flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2'>
                        <FilterPills value={filtroTipoInsc} onChange={setFiltroTipoInsc} options={FILTROS_TIPO} />
                        <span className='hidden md:block w-px h-5 bg-gray-base/30' />
                        <FilterPills value={filtroStatusInsc} onChange={setFiltroStatusInsc} options={FILTROS_STATUS} activeClass='bg-green-base text-white' />
                        <span className='hidden md:block w-px h-5 bg-gray-base/30' />
                        <FilterPills value={filtroLojaInsc} onChange={setFiltroLojaInsc} options={FILTROS_LOJA} />
                        <span className='hidden md:block w-px h-5 bg-gray-base/30' />
                        <FilterPills value={filtroPagamentoInsc} onChange={setFiltroPagamentoInsc} options={FILTROS_PAGAMENTO} activeClass='bg-gray-text text-white' />
                    </div>
                    <div className='flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2'>
                        <FilterPills value={filtroDataInsc} onChange={selecionarFiltroDataRapido} options={FILTROS_DATA} activeClass='bg-blue-base text-white' />
                        <span className='hidden md:block w-px h-5 bg-gray-base/30' />
                        <div className='flex items-center gap-1.5 text-xs text-gray-text/70'>
                            <label htmlFor='periodoInicio'>De</label>
                            <input
                                id='periodoInicio'
                                type='date'
                                value={periodoInicio}
                                onChange={e => selecionarPeriodo('inicio', e.target.value)}
                                className='border border-gray-base/30 rounded-md px-2 py-1 text-xs text-gray-text outline-none focus:border-orange-base'
                            />
                            <label htmlFor='periodoFim'>até</label>
                            <input
                                id='periodoFim'
                                type='date'
                                value={periodoFim}
                                onChange={e => selecionarPeriodo('fim', e.target.value)}
                                className='border border-gray-base/30 rounded-md px-2 py-1 text-xs text-gray-text outline-none focus:border-orange-base'
                            />
                        </div>
                    </div>
                </div>
                <hr className='border-gray-base/30 w-full mb-4'/>

                <div className='max-h-100 overflow-y-auto'>

                    <div className='hidden md:grid grid-cols-[1.3fr_0.7fr_0.5fr_0.5fr_0.5fr_0.5fr_0.9fr_0.5fr] gap-2
                                    text-xs font-semibold text-gray-text uppercase tracking-wider
                                    bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                        <p>CURSO</p>
                        <p>DATA CURSO</p>
                        <p>NOME</p>
                        <p>ASSENTO</p>
                        <p>STATUS</p>
                        <p>PAGAMENTO</p>
                        <p>INSCRITO EM</p>
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
                                    <span>{metodoPagamentoLabel(i.metodoPagamento)}</span>
                                    {curso?.data && <span>{formatDateBR(curso.data)}</span>}
                                    <span>Inscrito em {formatDateTimeBR(i.dataInscricao)}</span>
                                </div>
                                <div className='flex items-center justify-between mt-2'>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${statusBadgeClass(i.status)}`}>
                                        {i.status}
                                    </span>
                                    <div className='flex gap-2'>
                                        <InscricaoAcoes
                                            inscricao={i}
                                            curso={curso}
                                            verificandoMP={verificandoMP === i.id}
                                            reembolsando={reembolsando === i.id}
                                            onVerificarMP={() => handleVerificarMP(i.id)}
                                            onReembolsar={() => confirmarReembolso(i)}
                                            onExcluir={() => confirmarExclusao(i)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='hidden md:grid grid-cols-[1.3fr_0.7fr_0.5fr_0.5fr_0.5fr_0.5fr_0.9fr_0.5fr] gap-2
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
                                <p>{curso?.data ? formatDateBR(curso.data) : '-'}</p>
                                <p className='truncate'>{i.nome}</p>
                                <p>{i.assento}</p>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit text-white ${statusBadgeClass(i.status)}`}>
                                    {i.status}
                                </span>
                                <p>{metodoPagamentoLabel(i.metodoPagamento)}</p>
                                <p className='text-xs'>{formatDateTimeBR(i.dataInscricao)}</p>
                                <div className='flex gap-2'>
                                    <InscricaoAcoes
                                        inscricao={i}
                                        curso={curso}
                                        verificandoMP={verificandoMP === i.id}
                                        reembolsando={reembolsando === i.id}
                                        onVerificarMP={() => handleVerificarMP(i.id)}
                                        onReembolsar={() => confirmarReembolso(i)}
                                        onExcluir={() => confirmarExclusao(i)}
                                    />
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
                        <FilterPills value={filtroTipo} onChange={setFiltroTipo} options={FILTROS_TIPO} />
                        <span className='hidden md:block w-px h-5 bg-gray-base/30' />
                        <FilterPills value={filtroStatus} onChange={setFiltroStatus} options={FILTROS_STATUS} activeClass='bg-green-base text-white' />
                        <span className='hidden md:block w-px h-5 bg-gray-base/30' />
                        <FilterPills value={filtroLoja} onChange={setFiltroLoja} options={FILTROS_LOJA} />
                    </div>
                </div>
                <hr className='border-gray-base/30 w-full mb-4'/>

                <div className='max-h-100 overflow-y-auto'>

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

                    {loadingCourses || loadingChildren ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Carregando...</p></div>
                    ) : cursosExibidos.length === 0 ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhum curso encontrado</p></div>
                    ) : (
                        cursosExibidos.map(curso => (
                            <div key={`${curso.tipo}-${curso.id}`}>
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
                                        <span>{formatDateBR(curso.data)}</span>
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

                                <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.6fr_0.5fr_0.5fr] gap-2
                                                px-3 py-3 items-center text-gray-text text-sm
                                                hover:bg-gray/60 transition-colors rounded-md'>
                                    <p className='font-medium truncate'>{curso.nomeCurso}</p>
                                    <p className='truncate'>{curso.culinarista}</p>
                                    <p>{formatDateBR(curso.data)}</p>
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
                <p className='md:hidden text-xl font-bold mb-2 text-gray-text'>INSCRIÇÕES</p>
                <hr className='md:hidden border-gray-base/30 w-full mb-3'/>
                <div className='flex md:hidden flex-col gap-2 max-h-[65dvh] overflow-y-auto'>
                    {inscricoes.length === 0
                        ? <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'><Inbox size={36} /><p className='text-sm'>Nenhuma inscrição encontrada</p></div>
                        : inscricoes.map(inscricao => (
                            <div key={inscricao.id} className='bg-gray rounded-lg p-3'>
                                <div className='flex items-start justify-between gap-2 mb-2'>
                                    <p className='font-semibold text-gray-text text-sm'>{inscricao.nome}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 text-white ${statusBadgeClass(inscricao.status)}`}>
                                        {inscricao.status}
                                    </span>
                                </div>
                                <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-text/70 mb-3'>
                                    <span><span className='font-medium text-gray-text'>Assento </span>{inscricao.assento}</span>
                                    <span><span className='font-medium text-gray-text'>CPF </span>{inscricao.cpf}</span>
                                    <span><span className='font-medium text-gray-text'>Celular </span>{inscricao.celular}</span>
                                    <span><span className='font-medium text-gray-text'>Pagamento </span>{metodoPagamentoLabel(inscricao.metodoPagamento)}</span>
                                    <span className='col-span-2'><span className='font-medium text-gray-text'>Inscrição </span>{formatDateTimeBR(inscricao.dataInscricao)}</span>
                                </div>
                                <div className='flex gap-2'>
                                    <InscricaoAcoes
                                        inscricao={inscricao}
                                        curso={cursoModal}
                                        verificandoMP={verificandoMP === inscricao.id}
                                        reembolsando={reembolsando === inscricao.id}
                                        onVerificarMP={() => handleVerificarMP(inscricao.id)}
                                        onReembolsar={() => confirmarReembolso(inscricao)}
                                        onExcluir={() => confirmarExclusao(inscricao)}
                                    />
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className='hidden md:block max-h-100 overflow-y-auto'>

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
                                    <p>{metodoPagamentoLabel(inscricao.metodoPagamento)}</p>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit text-white ${statusBadgeClass(inscricao.status)}`}>
                                        {inscricao.status}
                                    </span>
                                    <p>{formatDateTimeBR(inscricao.dataInscricao)}</p>
                                    <div className='flex gap-2'>
                                        <InscricaoAcoes
                                            inscricao={inscricao}
                                            curso={cursoModal}
                                            verificandoMP={verificandoMP === inscricao.id}
                                            reembolsando={reembolsando === inscricao.id}
                                            onVerificarMP={() => handleVerificarMP(inscricao.id)}
                                            onReembolsar={() => confirmarReembolso(inscricao)}
                                            onExcluir={() => confirmarExclusao(inscricao)}
                                        />
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
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </AdminPage>
    )
}
