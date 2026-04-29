// HEAD
import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// React
import { useContext, useState, useEffect } from 'react';

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
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);
    const [inscricoes, setInscricoes] = useState({});
    const [filtroCursos, setFiltroCursos] = useState({});

    const { cursos, culinaristas } = useContext(DadosContext);

    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

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
        const hoje = new Date().toLocaleDateString('PT-BR');

        async function buscarDadosDashboard() {
            try {
                const dataInscricoes = await getTotalEnrollment();
                const dataCursos = await getCourses();

                const cursosHojeFiltrados = dataCursos.filter(c => layoutData(c.data) === hoje);

                const contagemCursosHoje = cursosHojeFiltrados.length;
                const idCursosHoje = cursosHojeFiltrados.map(c => c.id);

                const cursosConcluidos = dataCursos.filter(c => layoutData(c.data) < hoje).length;
                const cursosAtivos = dataCursos.filter(c => 
                    layoutData(c.data) > hoje || layoutData(c.data) === hoje
                ).length;

                setFiltroCursos({
                    cursosHoje: contagemCursosHoje,
                    cursosConcluidos,
                    cursosAtivos
                });

                const inscricoesPagas = dataInscricoes.filter(i => i.status === 'pago').length;
                const inscricoesVerificar = dataInscricoes.filter(i => i.status === 'verificar').length;

                const inscricoesHojePagas = dataInscricoes.filter(i => 
                    i.status === 'pago' && idCursosHoje.includes(i.cursoId)
                ).length;

                const inscricoesHojeVerificar = dataInscricoes.filter(i => 
                    i.status === 'verificar' && idCursosHoje.includes(i.cursoId)
                ).length;

                setInscricoes({
                    pagas: inscricoesPagas,
                    verificar: inscricoesVerificar,
                    hojePagas: inscricoesHojePagas,
                    hojeVerificar: inscricoesHojeVerificar
                });

            } catch(err) {
                console.log('Erro dashboard', err);
            }
        }

        buscarDadosDashboard();
    }, []);

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Dashboard'/>
            <SideBar />

            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title='Dashboard' />

                <div className='flex flex-col gap-10 mt-10 w-[92dvw] md:w-[78vw]'>

                    {/* CARDS */}
                    <section>
                        <div className='flex flex-col gap-7 md:flex-row'>
                            
                            <div className='grid grid-cols-2 gap-7 w-full md:w-[50%]'>
                                
                                <CardDash>
                                    <div className='flex flex-col text-center'>
                                        <p className='text-6xl mt-auto'>
                                            {filtroCursos.cursosAtivos || '0'}
                                        </p>
                                        <p>Cursos Ativos</p>
                                    </div>
                                </CardDash>

                                <CardDash>
                                    <div className='flex flex-col text-center'>
                                        <p className='text-6xl mt-auto'>
                                            {cursos.length || '0'}
                                        </p>
                                        <p>Cursos Totais</p>
                                    </div>
                                </CardDash>

                                <CardDash>
                                    <div className='flex flex-col text-center'>
                                        <p className='text-6xl mt-auto text-green-base'>
                                            {filtroCursos.cursosHoje || '0'}
                                        </p>
                                        <p>Cursos Hoje</p>
                                    </div>
                                </CardDash>

                                <CardDash>
                                    <div className='flex flex-col text-center'>
                                        <p className='text-6xl mt-auto text-red-base'>
                                            {filtroCursos.cursosConcluidos || '0'}
                                        </p>
                                        <p>Cursos Concluídos</p>
                                    </div>
                                </CardDash>

                            </div>

                            <div className='flex gap-7 md:w-[50%]'>

                                <CardDash className='w-1/2 text-center'>
                                    <p className='text-2xl font-bold'>Totais</p>
                                    <p className='text-4xl text-green-base'>{inscricoes.pagas || 0}</p>
                                    <p>Pagas</p>

                                    <p className='text-4xl text-red-base mt-4'>{inscricoes.verificar || 0}</p>
                                    <p>A verificar</p>
                                </CardDash>

                                <CardDash className='w-1/2 text-center'>
                                    <p className='text-2xl font-bold'>Hoje</p>
                                    <p className='text-4xl text-green-base'>{inscricoes.hojePagas || 0}</p>
                                    <p>Pagas</p>

                                    <p className='text-4xl text-red-base mt-4'>{inscricoes.hojeVerificar || 0}</p>
                                    <p>A verificar</p>
                                </CardDash>

                            </div>

                        </div>
                    </section>

                    {/* CURSOS */}
                    <section>
                        <h2 className='text-2xl font-bold text-center'>Cursos</h2>

                        {cursos.length === 0 ? (
                            <p>Nenhum curso</p>
                        ) : (
                            <div className='flex gap-2 overflow-x-auto p-4'>
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
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* CULINARISTAS */}
                    <section>
                        <h2 className='text-2xl font-bold text-center'>Culinaristas</h2>

                        {culinaristas.length === 0 ? (
                            <p>Nenhuma</p>
                        ) : (
                            <div className='flex gap-2 overflow-x-auto p-4'>
                                {culinaristas.map(c => (
                                    <CulinarianCard
                                        key={c.id}
                                        culinarista={c.nomeCulinarista}
                                        industria={c.industria}
                                        telefone={c.telefone}
                                        instagram={c.instagram}
                                        lojas={c.lojas}
                                        cursos={c.cursos}
                                        imagem={c.foto}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </main>
        </div>
    );
}