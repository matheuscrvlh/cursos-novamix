import { useContext, useState, useEffect } from 'react';
import { BookOpen, CalendarCheck, CheckCircle2, CreditCard, AlertCircle, Loader2, Users, UserCheck, UserPlus } from 'lucide-react';

import CardDash from '../../components/admin/CardDash'
import CourseCard from '../../components/public/CourseCard'
import CulinarianCard from '../../components/admin/CulinarianCard';
import AdminPage from '../../layouts/admin/AdminPage';
import RevenueAreaChart from '../../components/admin/charts/RevenueAreaChart';
import StatusDonutChart from '../../components/admin/charts/StatusDonutChart';

import { getSeats, getTotalEnrollment } from '../../api/enrollment.services';
import { getCourses } from '../../api/courses.services';
import { getChildren } from '../../api/children.services';
import { getClientesStats } from '../../api/clientes.services';

import { DadosContext } from '../../contexts/DadosContext';
import { formatDateBR, cursoEncerrado } from '../../utils/formatDate';
import { formatarPreco } from '../../utils/formatCurrency';

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CORES_STATUS = {
    pago: '#7BAD7F',
    pendente: '#FFE700',
    cancelado: '#1E8581',
    recusado: '#F72B2A',
    reembolsado: '#DF0406',
};

// últimos 6 meses (incluindo o atual), faturamento = soma do valor do curso
// pra cada inscrição paga cujo dataInscricao caiu naquele mês
function calcularFaturamentoMensal(inscricoesPagas, cursosPorId) {
    const meses = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        meses.push({ ano: d.getFullYear(), mes: d.getMonth(), label: NOMES_MES[d.getMonth()], value: 0 });
    }

    for (const insc of inscricoesPagas) {
        const data = new Date(insc.dataInscricao);
        if (Number.isNaN(data.getTime())) continue;
        const bucket = meses.find(m => m.ano === data.getFullYear() && m.mes === data.getMonth());
        if (!bucket) continue;
        const curso = cursosPorId[insc.cursoId];
        if (!curso) continue;
        bucket.value += Number(curso.valor) || 0;
    }

    return meses;
}

export default function DashboardAdmin() {

    const [vagasPorCurso, setVagasPorCurso] = useState({});

    const [inscricoes, setInscricoes] = useState([]);
    const [loadingInscricoes, setLoadingInscricoes] = useState(true)
    const [faturamentoMensal, setFaturamentoMensal] = useState([]);

    const [clientesStats, setClientesStats] = useState(null);
    const [loadingClientes, setLoadingClientes] = useState(true);

    const [filtroCursos, setFiltroCursos] = useState([]);

    const {
        cursos,
        culinaristas,
        loadingCourses,
    } = useContext(DadosContext);

    // formato ISO (YYYY-MM-DD) — usado só pro card "Hoje" (contagem por data);
    // ativo/concluído usa cursoEncerrado (data + hora) em vez de comparar só a data
    const now = new Date();
    const hoje = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const cursosAtivos = cursos.filter(c => !cursoEncerrado(c));

    useEffect(() => {
        if (!cursos.length) return;
        async function loadVagas() {
            const resultado = {};
            await Promise.all(
                cursos.map(async (curso) => {
                    try {
                        const assentos = await getSeats(curso.id);
                        const lista = Array.isArray(assentos) ? assentos : [];
                        resultado[curso.id] = { livres: lista.filter(v => v.status === 'livre').length, total: lista.length };
                    } catch {
                        resultado[curso.id] = { livres: 0, total: 0 };
                    }
                })
            );
            setVagasPorCurso(resultado);
        }
        loadVagas();
    }, [cursos]);

    useEffect(() => {
        async function buscarDadosDashboard() {
            setLoadingInscricoes(true);

            try {
                const dataInscricoes = await getTotalEnrollment();
                const dataCursos = await getCourses();
                const dataCursosInfantis = await getChildren();

                const cursosHojeFiltrados = dataCursos.filter(c => c.data === hoje);
                const contagemCursosHoje = cursosHojeFiltrados.length

                const cursosAtivosFiltrados = dataCursos.filter(c => !cursoEncerrado(c));
                const cursosConcluidos = dataCursos.filter(c => cursoEncerrado(c)).length;
                const cursosAtivos = cursosAtivosFiltrados.length;

                setFiltroCursos({ cursosHoje: contagemCursosHoje, cursosConcluidos, cursosAtivos })

                // a tabela de inscrições mistura cursos normais e infantis pelo mesmo
                // cursoId, então precisa considerar as duas listas pra saber quais ainda
                // não aconteceram — só essas entram no resumo de inscrições
                const idCursosAtivos = [
                    ...cursosAtivosFiltrados.map(c => c.id),
                    ...dataCursosInfantis.filter(c => !cursoEncerrado(c)).map(c => c.id),
                ];

                const inscricoesAtivas = dataInscricoes.filter(i => idCursosAtivos.includes(i.cursoId));

                const contarStatus = status => inscricoesAtivas.filter(i => i.status === status).length;

                setInscricoes({
                    pagas: contarStatus('pago'),
                    pendentes: contarStatus('pendente'),
                    canceladas: contarStatus('cancelado'),
                    recusadas: contarStatus('recusado'),
                    reembolsadas: contarStatus('reembolsado'),
                })

                // faturamento considera TODAS as inscrições pagas (não só de
                // cursos ainda ativos) — é sobre o que já vendeu
                const cursosPorId = Object.fromEntries(
                    [...dataCursos, ...dataCursosInfantis].map(c => [c.id, c])
                );
                const inscricoesPagas = dataInscricoes.filter(i => i.status === 'pago');
                setFaturamentoMensal(calcularFaturamentoMensal(inscricoesPagas, cursosPorId));

            } catch(err) {
                console.log('Nao foi possivel pegar as inscricoes', err);
            } finally {
                setLoadingInscricoes(false)
            }
        }
        buscarDadosDashboard()
    }, [hoje])

    useEffect(() => {
        setLoadingClientes(true);
        getClientesStats()
            .then(setClientesStats)
            .catch(err => console.log('Nao foi possivel pegar as estatisticas de clientes', err))
            .finally(() => setLoadingClientes(false));
    }, [])

    return (
        <AdminPage title='Dashboard'>

            <div className='flex flex-col gap-3'>
                <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Cursos</p>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Ativos</p>
                            <div className='w-8 h-8 rounded-full bg-orange-base/10 flex items-center justify-center'>
                                <BookOpen size={15} className='text-orange-base' />
                            </div>
                        </div>
                        {loadingCourses
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-gray-text'>{filtroCursos.cursosAtivos || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Totais</p>
                            <div className='w-8 h-8 rounded-full bg-gray-base/10 flex items-center justify-center'>
                                <BookOpen size={15} className='text-gray-base' />
                            </div>
                        </div>
                        {loadingCourses
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-gray-text'>{cursos.length}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Hoje</p>
                            <div className='w-8 h-8 rounded-full bg-green-base/10 flex items-center justify-center'>
                                <CalendarCheck size={15} className='text-green-base' />
                            </div>
                        </div>
                        {loadingCourses
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-green-base'>{filtroCursos.cursosHoje || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Concluídos</p>
                            <div className='w-8 h-8 rounded-full bg-red-base/10 flex items-center justify-center'>
                                <CheckCircle2 size={15} className='text-red-base' />
                            </div>
                        </div>
                        {loadingCourses
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-red-base'>{filtroCursos.cursosConcluidos || 0}</p>
                        }
                    </div>

                </div>
            </div>

            <div className='flex flex-col gap-3 -mt-4'>
                <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Inscrições</p>
                <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Pagas</p>
                            <div className='w-8 h-8 rounded-full bg-green-base/10 flex items-center justify-center'>
                                <CreditCard size={15} className='text-green-base' />
                            </div>
                        </div>
                        {loadingInscricoes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-green-base'>{inscricoes.pagas || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Pendentes</p>
                            <div className='w-8 h-8 rounded-full bg-orange-light/10 flex items-center justify-center'>
                                <AlertCircle size={15} className='text-orange-light' />
                            </div>
                        </div>
                        {loadingInscricoes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-orange-light'>{inscricoes.pendentes || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Canceladas</p>
                            <div className='w-8 h-8 rounded-full bg-gray-base/10 flex items-center justify-center'>
                                <AlertCircle size={15} className='text-gray-base' />
                            </div>
                        </div>
                        {loadingInscricoes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-gray-base'>{inscricoes.canceladas || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Recusadas</p>
                            <div className='w-8 h-8 rounded-full bg-red-light/10 flex items-center justify-center'>
                                <AlertCircle size={15} className='text-red-light' />
                            </div>
                        </div>
                        {loadingInscricoes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-red-light'>{inscricoes.recusadas || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Reembolsadas</p>
                            <div className='w-8 h-8 rounded-full bg-red-base/10 flex items-center justify-center'>
                                <CreditCard size={15} className='text-red-base' />
                            </div>
                        </div>
                        {loadingInscricoes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-red-base'>{inscricoes.reembolsadas || 0}</p>
                        }
                    </div>

                </div>
            </div>

            <div className='flex flex-col gap-3 -mt-4'>
                <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Clientes</p>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Total</p>
                            <div className='w-8 h-8 rounded-full bg-gray-base/10 flex items-center justify-center'>
                                <Users size={15} className='text-gray-base' />
                            </div>
                        </div>
                        {loadingClientes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-gray-text'>{clientesStats?.total || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Ativos</p>
                            <div className='w-8 h-8 rounded-full bg-green-base/10 flex items-center justify-center'>
                                <UserCheck size={15} className='text-green-base' />
                            </div>
                        </div>
                        {loadingClientes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-green-base'>{clientesStats?.ativos || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Cadastrados hoje</p>
                            <div className='w-8 h-8 rounded-full bg-blue-base/10 flex items-center justify-center'>
                                <UserPlus size={15} className='text-blue-base' />
                            </div>
                        </div>
                        {loadingClientes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-blue-base'>{clientesStats?.hoje || 0}</p>
                        }
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Cadastrados este mês</p>
                            <div className='w-8 h-8 rounded-full bg-orange-base/10 flex items-center justify-center'>
                                <CalendarCheck size={15} className='text-orange-base' />
                            </div>
                        </div>
                        {loadingClientes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-orange-base'>{clientesStats?.mes || 0}</p>
                        }
                    </div>

                </div>

                <div className='bg-white rounded-xl shadow-sm p-5'>
                    <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider mb-4'>Top 10 clientes</p>
                    {loadingClientes ? (
                        <div className='flex flex-col items-center gap-2 py-16 text-gray-text/40'>
                            <Loader2 size={28} className='animate-spin text-orange-base' />
                            <p className='text-sm'>Carregando...</p>
                        </div>
                    ) : !clientesStats?.top?.length ? (
                        <p className='text-gray-text/60 text-sm py-8 text-center'>Nenhum cliente com inscrição paga ainda</p>
                    ) : (
                        <div className='flex flex-col max-h-70 overflow-y-auto pr-1'>
                            {clientesStats.top.map((c, i) => (
                                <div key={c.id} className='flex items-center justify-between gap-3 py-2.5 border-b border-gray-base/10 last:border-0'>
                                    <div className='flex items-center gap-3 min-w-0'>
                                        <span className='w-6 h-6 shrink-0 rounded-full bg-orange-base/10 text-orange-base text-xs font-bold flex items-center justify-center'>
                                            {i + 1}
                                        </span>
                                        <div className='min-w-0'>
                                            <p className='text-sm font-medium text-gray-text truncate'>{c.nome}</p>
                                            <p className='text-xs text-gray-text/50 truncate'>{c.email}</p>
                                        </div>
                                    </div>
                                    <div className='text-right shrink-0'>
                                        <p className='text-sm font-bold text-green-base'>R$ {formatarPreco(c.totalGasto)}</p>
                                        <p className='text-xs text-gray-text/50'>{c.totalInscricoes} inscrição(ões)</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                <div className='bg-white rounded-xl shadow-sm p-5 lg:col-span-2'>
                    <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider mb-4'>Faturamento — últimos 6 meses</p>
                    {loadingInscricoes
                        ? <div className='flex flex-col items-center gap-2 py-16 text-gray-text/40'><Loader2 size={28} className='animate-spin text-orange-base' /><p className='text-sm'>Carregando...</p></div>
                        : <RevenueAreaChart data={faturamentoMensal} />
                    }
                </div>

                <div className='bg-white rounded-xl shadow-sm p-5'>
                    <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider mb-4'>Inscrições por status</p>
                    {loadingInscricoes
                        ? <div className='flex flex-col items-center gap-2 py-16 text-gray-text/40'><Loader2 size={28} className='animate-spin text-orange-base' /><p className='text-sm'>Carregando...</p></div>
                        : <StatusDonutChart data={[
                            { label: 'Pagas', value: inscricoes.pagas || 0, color: CORES_STATUS.pago },
                            { label: 'Pendentes', value: inscricoes.pendentes || 0, color: CORES_STATUS.pendente },
                            { label: 'Canceladas', value: inscricoes.canceladas || 0, color: CORES_STATUS.cancelado },
                            { label: 'Recusadas', value: inscricoes.recusadas || 0, color: CORES_STATUS.recusado },
                            { label: 'Reembolsadas', value: inscricoes.reembolsadas || 0, color: CORES_STATUS.reembolsado },
                        ]} />
                    }
                </div>
            </div>

            <section className='flex flex-col gap-4'>
                <div className='flex items-center gap-3'>
                    <h2 className='font-bold text-gray-text text-lg shrink-0'>CURSOS</h2>
                    <div className='flex-1 h-px bg-gray-base/20'/>
                </div>
                {cursosAtivos.length === 0
                    ? <p className='text-gray-text/60 text-sm'>Nenhum curso ativo encontrado</p>
                    : <div className='flex gap-4 overflow-x-auto pb-3 -mx-4 px-4'>
                        {cursosAtivos.map(curso => {
                            return (
                                <CourseCard
                                    key={curso.id}
                                    id={curso.id}
                                    curso={curso.nomeCurso}
                                    data={formatDateBR(curso.data)}
                                    horario={curso.hora}
                                    loja={curso.loja}
                                    culinarista={curso.culinarista}
                                    duracao={curso.duracao}
                                    categoria={curso.categoria}
                                    vagasLivres={vagasPorCurso[curso.id]?.livres ?? '...'}
                                    vagasReservadas={vagasPorCurso[curso.id]?.total ?? 0}
                                    valor={curso.valor}
                                    className='w-75 shrink-0'
                                    imagem={
                                        curso.fotos?.length
                                            ? curso.fotos[0]
                                            : null
                                    }
                                />
                            )
                        })}
                    </div>
                }
            </section>

            <section className='flex flex-col gap-4'>
                <div className='flex items-center gap-3'>
                    <h2 className='font-bold text-gray-text text-lg shrink-0'>CULINARISTAS</h2>
                    <div className='flex-1 h-px bg-gray-base/20'/>
                </div>
                {culinaristas.length === 0
                    ? <p className='text-gray-text/60 text-sm'>Nenhuma culinarista encontrada</p>
                    : <div className='flex gap-4 overflow-x-auto pb-3 -mx-4 px-4'>
                        {culinaristas.map(culinarista => (
                            <CulinarianCard
                                key={culinarista.id}
                                culinarista={culinarista.nomeCulinarista}
                                industria={culinarista.industria}
                                telefone={culinarista.telefone}
                                instagram={culinarista.instagram}
                                className='w-75 shrink-0'
                                lojas={
                                    culinarista.lojas.length === 0
                                        ? 'Nenhuma'
                                        : culinarista.lojas
                                }
                                cursos={
                                    culinarista.cursos.length === 0
                                        ? 'Nenhum'
                                        : culinarista.cursos
                                }
                                imagem={
                                    culinarista.foto === null
                                        ? null
                                        : culinarista.foto
                                }
                            />
                        ))}
                    </div>
                }
            </section>

        </AdminPage>
    )
}
