import { useContext, useState, useEffect } from 'react';
import { BookOpen, CalendarCheck, CheckCircle2, CreditCard, AlertCircle } from 'lucide-react';

import CardDash from '../../components/admin/CardDash'
import CourseCard from '../../components/public/CourseCard'
import CulinarianCard from '../../components/admin/CulinarianCard';
import AdminPage from '../../layouts/admin/AdminPage';

import { getSeats, getTotalEnrollment } from '../../api/enrollment.services';
import { getCourses } from '../../api/courses.services';

import { DadosContext } from '../../contexts/DadosContext';
import { formatDateBR } from '../../utils/formatDate';

export default function DashboardAdmin() {

    const [vagasPorCurso, setVagasPorCurso] = useState({});

    const [inscricoes, setInscricoes] = useState([]);
    const [loadingInscricoes, setLoadingInscricoes] = useState(true)

    const [filtroCursos, setFiltroCursos] = useState([]);

    const {
        cursos,
        culinaristas,
        loadingCourses,
    } = useContext(DadosContext);

    useEffect(() => {
        if (!cursos.length) return;
        async function loadVagas() {
            const resultado = {};
            await Promise.all(
                cursos.map(async (curso) => {
                    try {
                        const assentos = await getSeats(curso.id);
                        const lista = Array.isArray(assentos) ? assentos : [];
                        resultado[curso.id] = lista.filter(v => v.status === 'livre').length;
                    } catch {
                        resultado[curso.id] = 0;
                    }
                })
            );
            setVagasPorCurso(resultado);
        }
        loadVagas();
    }, [cursos]);

    useEffect(() => {
        const hoje = new Date().toLocaleDateString('PT-BR');

        async function buscarDadosDashboard() {
            setLoadingInscricoes(true);

            try {
                const dataInscricoes = await getTotalEnrollment();
                const dataCursos = await getCourses();

                const cursosHojeFiltrados = dataCursos.filter(c => formatDateBR(c.data) === hoje);

                const contagemCursosHoje = cursosHojeFiltrados.length
                const idCursosHoje = cursosHojeFiltrados.map(c => c.id)

                const cursosConcluidos = dataCursos.filter(c => formatDateBR(c.data) < hoje).length;
                const cursosAtivos = dataCursos.filter(c => formatDateBR(c.data) >= hoje).length;

                setFiltroCursos({ cursosHoje: contagemCursosHoje, cursosConcluidos, cursosAtivos })

                const inscricoesPagas = dataInscricoes.filter(i => i.status === 'pago').length;
                const inscricoesPendentes = dataInscricoes.filter(i => i.status === 'pendente').length;

                const inscricoesHojePagas = dataInscricoes.filter(i =>
                    i.status === 'pago' && idCursosHoje.includes(i.cursoId)
                ).length;

                const inscricoesHojePendentes = dataInscricoes.filter(i =>
                    i.status === 'pendente' && idCursosHoje.includes(i.cursoId)
                ).length;

                setInscricoes({ pagas: inscricoesPagas, pendentes: inscricoesPendentes, hojePagas: inscricoesHojePagas, hojePendentes: inscricoesHojePendentes })

            } catch(err) {
                console.log('Nao foi possivel pegar as inscricoes', err);
            } finally {
                setLoadingInscricoes(false)
            }
        }
        buscarDadosDashboard()
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
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Pendentes</p>
                            <div className='w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center'>
                                <AlertCircle size={15} className='text-yellow-500' />
                            </div>
                        </div>
                        {loadingInscricoes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-yellow-500'>{inscricoes.pendentes || 0}</p>
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
                            <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wider'>Pendentes Hoje</p>
                            <div className='w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center'>
                                <AlertCircle size={15} className='text-yellow-500' />
                            </div>
                        </div>
                        {loadingInscricoes
                            ? <p className='text-2xl font-bold text-gray-text/40'>...</p>
                            : <p className='text-4xl font-bold text-yellow-500'>{inscricoes.hojePendentes || 0}</p>
                        }
                    </div>

                </div>
            </div>

            <section className='flex flex-col gap-4'>
                <div className='flex items-center gap-3'>
                    <h2 className='font-bold text-gray-text text-lg shrink-0'>CURSOS</h2>
                    <div className='flex-1 h-px bg-gray-base/20'/>
                </div>
                {cursos.length === 0
                    ? <p className='text-gray-text/60 text-sm'>Nenhum curso encontrado</p>
                    : <div className='flex gap-4 overflow-x-auto pb-3 -mx-4 px-4'>
                        {cursos.map(curso => {
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
                                    vagasLivres={vagasPorCurso[curso.id] ?? '...'}
                                    vagasReservadas={24}
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
