// HEAD
import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// React
import { useContext, useState, useEffect } from 'react';

// Icons
import { BookOpen, CalendarCheck, CheckCircle2, ArchiveX, CreditCard, AlertCircle } from 'lucide-react';

// Components
import CardDash from '../../components/admin/CardDash'
import CourseCard from '../../components/public/CourseCard'
import CulinarianCard from '../../components/admin/CulinarianCard';

// SERVICES
import { getSeats, getTotalEnrollment } from '../../api/enrollment.services';
import { getCourses } from '../../api/courses.services';

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function DashboardAdmin() {
    // ========= STATE VAGAS ========= 
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    // ========= STATE INSCRICOES ========= 
    const [inscricoes, setInscricoes] = useState([]);
    const [loadingInscricoes, setLoadingInscricoes] = useState(true)

    // ========= STATE CURSOS HOJE ========= 
    const [filtroCursos, setFiltroCursos] = useState([]);

    // ========= DADOS CONTEXT
    const {
        cursos,
        culinaristas,
        loadingCourses,
        loadingCulinarian,
        loadingIndustries,
        loadingChildren
    } = useContext(DadosContext);

    // ======= FUNCOES =========
    // layout data
    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // BUSCA VAGAS LIVRES E RESERVADAS
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

    // BUSCA DADOS DASHBOARD
    useEffect(() => {
        const hoje = new Date().toLocaleDateString('PT-BR');

        async function buscarDadosDashboard() {
            setLoadingInscricoes(true);

            try {
                // CONSULTA
                const dataInscricoes = await getTotalEnrollment();
                const dataCursos = await getCourses();

                // CURSOS
                const cursosHojeFiltrados = dataCursos.filter(c => layoutData(c.data) === hoje);

                const contagemCursosHoje = cursosHojeFiltrados.length
                const idCursosHoje = cursosHojeFiltrados.map(c => c.id)

                const cursosConcluidos = dataCursos.filter(c => 
                    layoutData(c.data) < hoje
                ).length;
                const cursosAtivos = dataCursos.filter(c => 
                    layoutData(c.data) > hoje || layoutData(c.data) === hoje
                ).length;
                // STATE CURSOS
                setFiltroCursos({cursosHoje: contagemCursosHoje, cursosConcluidos: cursosConcluidos, cursosAtivos: cursosAtivos})

                // =============================================
                // INSCRICOES
                const inscricoesPagas = dataInscricoes.filter(i => i.status === 'pago').length;
                const inscricoesVerificar = dataInscricoes.filter(i => i.status === 'verificar').length;

                const inscricoesHojePagas = dataInscricoes.filter(i => 
                    i.status === 'pago' &&
                    idCursosHoje.includes(i.cursoId)
                ).length;
                
                const inscricoesHojeVerificar = dataInscricoes.filter(i => 
                    i.status === 'verificar' &&
                    idCursosHoje.includes(i.cursoId)
                ).length;
                // STATE INSCRICOES
                setInscricoes({pagas: inscricoesPagas, verificar: inscricoesVerificar, hojePagas: inscricoesHojePagas, hojeVerificar: inscricoesHojeVerificar})

            } catch(err) {
                console.log('Nao foi possivel pegar as inscricoes', err);
            } finally {
                setLoadingInscricoes(false)
            }
        }
        buscarDadosDashboard() 
    }, [])

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Dashboard'/>
            <SideBar />
            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Dashboard'} />

                <section className='flex flex-col gap-10 mt-10 w-[92dvw] md:w-[78vw]'>

                    {/* ======== CURSOS STATS ========== */}
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

                    {/* ======== INSCRICOES STATS ========== */}
                    <div className='flex flex-col gap-3 -mt-4'>
                        <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Inscrições</p>
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>

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
                                    <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>A Verificar</p>
                                    <div className='w-8 h-8 rounded-full bg-red-base/10 flex items-center justify-center'>
                                        <AlertCircle size={15} className='text-red-base' />
                                    </div>
                                </div>
                                {loadingInscricoes
                                    ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                                    : <p className='text-4xl font-bold text-red-base'>{inscricoes.verificar || 0}</p>
                                }
                            </div>

                            <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Pagas Hoje</p>
                                    <div className='w-8 h-8 rounded-full bg-green-base/10 flex items-center justify-center'>
                                        <CreditCard size={15} className='text-green-base' />
                                    </div>
                                </div>
                                {loadingInscricoes
                                    ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                                    : <p className='text-4xl font-bold text-green-base'>{inscricoes.hojePagas || 0}</p>
                                }
                            </div>

                            <div className='bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Verificar Hoje</p>
                                    <div className='w-8 h-8 rounded-full bg-red-base/10 flex items-center justify-center'>
                                        <AlertCircle size={15} className='text-red-base' />
                                    </div>
                                </div>
                                {loadingInscricoes
                                    ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                                    : <p className='text-4xl font-bold text-red-base'>{inscricoes.hojeVerificar || 0}</p>
                                }
                            </div>

                        </div>
                    </div>

                    {/* ======== CURSOS ========== */}
                    <section className='flex flex-col gap-4'>
                        <div className='flex items-center gap-3'>
                            <h2 className='font-bold text-gray-text text-lg shrink-0'>CURSOS</h2>
                            <div className='flex-1 h-px bg-gray-base/20'/>
                        </div>
                        {cursos.length === 0
                            ? <p className='text-gray-text/60 text-sm'>Nenhum curso encontrado</p>
                            : <div className='flex gap-4 overflow-x-auto pb-3 -mx-4 px-4'>
                                {cursos.map(curso => {
                                    const vagas = vagasPorCurso[curso.id] || { livres: 0, reservadas: 0 };
                                    return (
                                        <CourseCard
                                            key={curso.id}
                                            id={curso.id}
                                            curso={curso.nomeCurso}
                                            data={layoutData(curso.data)}
                                            horario={curso.hora}
                                            loja={curso.loja}
                                            culinarista={curso.culinarista}
                                            duracao={curso.duracao}
                                            categoria={curso.categoria}
                                            vagasLivres={vagas.livres}
                                            vagasReservadas={vagas.reservadas}
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

                    {/* ======== CULINARISTAS ========== */}
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

                </section>
            </main>
        </div>
    )
}