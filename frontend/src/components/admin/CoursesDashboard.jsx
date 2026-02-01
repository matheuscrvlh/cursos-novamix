// React
import { useContext, useState, useEffect } from 'react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import CourseCard from '../../components/public/CourseCard'
import CulinarianCard from '../public/CulinarianCard';

// SERVICES
import { getAssentos, getCourses, getInscricoesTotais } from '../../api/courses.service';

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function CoursesDashboard() {
    const {
        cursos,
        loading,
        culinaristas,
    } = useContext(DadosContext);

    // ========= STATE VAGAS ========= 
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    // ========= STATE INSCRICOES ========= 
    const [inscricoes, setInscricoes] = useState([]);

    // ========= STATE CURSOS HOJE ========= 
    const [filtroCursos, setFiltroCursos] = useState([]);

    // ====== FUNCOES
    // layout data
    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function parseDateISO(data) {
        const [ano, mes, dia] = data.split('-')
        return new Date(ano, mes - 1, dia)
    }

    // buscar vagas livres e reservadas
    useEffect(() => {
        if (!cursos.length) return;

        async function loadVagas() {
            const resultado = {};

            await Promise.all(
                cursos.map(async (curso) => {
                    const assentos = await getAssentos(curso.id);
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
                // CONSULTA
                const dataInscricoes = await getInscricoesTotais();
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
            }
        }
        buscarDadosDashboard() 
    }, [])

    return (
        <Text as='section' className='
            flex flex-col gap-10 mt-10 w-[92dvw]
            md:gap-20 md:w-[78vw]
        '>
            {/* ======== INFO CARDS ==========*/}
            <Text as='section' className='w-full'>
                <Text as='article' className='
                    flex flex-col gap-7
                    md:flex-row md:gap-7
                '>
                    <Text as='div' className='
                        grid grid-cols-2 gap-7 w-full h-auto
                        md:grid-cols-2 md:w-[50%] md:h-[350px]
                    '>
                        <CardDash>
                            <Text as='div' className='w-full h-full flex flex-col text-center gap-1'>
                                {filtroCursos.cursosAtivos === '' 
                                    ? <Text as='p' className='font-semibold text-xl mt-auto text-gray-text'>Nenhum</Text>
                                    : <Text as='p' className='font-semibold text-6xl mt-auto text-gray-text'>{filtroCursos.cursosAtivos}</Text>
                                }
                                <Text as='p' className='mb-auto text-gray-text'>Cursos Ativos</Text>
                            </Text>
                            
                        </CardDash>
                        <CardDash>
                            <Text as='div' className='w-full h-full flex flex-col text-center gap-1'>
                                {cursos.length > 0 
                                    ? <Text as='p' className='font-semibold text-6xl mt-auto text-gray-text'>{cursos.length}</Text>
                                    : <Text as='p' className='font-semibold text-xl mt-auto text-gray-text'>Nenhum</Text>
                                }
                                <Text as='p' className='mb-auto text-gray-text'>Cursos Totais</Text>
                            </Text>
                        </CardDash>
                        <CardDash>
                            <Text as='div' className='w-full h-full flex flex-col text-center gap-1'>
                                {filtroCursos.cursosHoje > 0
                                    ? <Text as='p' className='font-semibold text-6xl mt-auto text-green-base'>{filtroCursos.cursosHoje}</Text>
                                    : <Text as='p' className='font-semibold text-xl mt-auto text-gray-text'>Nenhum</Text>
                                }
                                <Text as='p' className='mb-auto text-gray-text'>Cursos Hoje</Text>
                            </Text>
                        </CardDash>
                        <CardDash>
                            <Text as='div' className='w-full h-full flex flex-col text-center gap-1'>
                                {filtroCursos.cursosConcluidos === '' 
                                    ? <Text as='p' className='font-semibold text-xl mt-auto text-gray-text'>Nenhum</Text>
                                    : <Text as='p' className='font-semibold text-6xl mt-auto text-red-base'>{filtroCursos.cursosConcluidos}</Text>
                                }
                                <Text as='p' className='mb-auto text-gray-text'>Cursos Concluidos</Text>
                            </Text>
                        </CardDash>
                    </Text>
                    <Text as='div' className='
                        flex gap-7
                        md:w-[50%] md:h-[350px]
                    '>
                        <CardDash className='w-[50%] flex flex-col justify-center items-center'>
                            <Text as='div' className='w-full flex flex-col text-center'>
                                <Text as='p' className='font-bold text-2xl text-gray-text mb-4'>TOTAIS</Text>
                                <Text as='p' className='font-semibold text-4xl text-green-base'>{inscricoes.pagas === '' ? 'Nenhuma' : inscricoes.pagas}</Text>
                                <Text as='p'>Inscricoes pagas</Text> 
                            </Text>
                            <Text as='div' className='w-full flex flex-col text-center mt-4'>
                                <Text as='p' className='font-semibold text-4xl text-red-base'>{inscricoes.verificar === '' ? '' : inscricoes.verificar}</Text>
                                <Text as='p'>Inscricoes a verificar</Text>
                            </Text>
                        </CardDash>
                        <CardDash className='w-[50%] flex flex-col justify-center items-center'>
                            <Text as='div' className='w-full flex flex-col text-center mt-4'>
                                <Text as='p' className='font-bold text-2xl text-gray-text mb-4'>HOJE</Text>
                                <Text as='p' className='font-semibold text-4xl text-green-base'>{inscricoes.hojePagas === '' ? '' : inscricoes.hojePagas}</Text>
                                <Text as='p'>Inscricoes pagas</Text> 
                            </Text>
                            <Text as='div' className='w-full flex flex-col text-center mt-4'>
                                <Text as='p' className='font-semibold text-4xl text-red-base'>{inscricoes.hojeVerificar === '' ? '' : inscricoes.hojeVerificar}</Text>
                                <Text as='p'>Inscricoes a verificar</Text>
                            </Text>
                        </CardDash>
                    </Text>
                </Text>
            </Text>
            {/* ======== CURSOS ==========*/}
            <Text as='section' className='flex flex-col gap-3'>
                <Text as='h2' className='font-bold text-gray-text text-2xl'>CURSOS</Text>
                <Text as='article' className='flex flex-col gap-5'>
                    <Text as='div'>
                        <Text
                            as='div'
                            className="
                                w-[100dvw]
                                max-h-[600px]
                                h-full
                                flex
                                gap-4
                                overflow-x-auto
                                overflow-y-hidden
                                whitespace-nowrap
                                md:w-[81vw]
                            "
                        >
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
                                        className='min-w-[300px]'
                                        imagem={
                                            curso.fotos?.length
                                                ? curso.fotos[0]
                                                : null
                                        }
                                    />
                                )
                            })}
                        </Text>
                    </Text>
                </Text>
            </Text>
            {/* ======== CULINARISTAS ==========*/}
            <Text as='section' className='flex flex-col gap-3'>
                <Text as='h2' className='font-bold text-gray-text text-2xl'>CULINARISTAS</Text>
                <Text as='article'>
                    <Text
                        as='div'
                        className="
                            w-[100dvw]
                            max-h-[600px]
                            h-full
                            flex
                            gap-4
                            overflow-x-auto
                            overflow-y-hidden
                            whitespace-nowrap
                            md:w-[81vw]
                        "
                    >
                        {culinaristas.map(culinarista => {

                            return (
                                <CulinarianCard
                                    key={culinarista.id}
                                    culinarista={culinarista.nomeCulinarista}
                                    industria={culinarista.industria}
                                    telefone={culinarista.telefone}
                                    instagram={culinarista.instagram}
                                    className='min-w-[300px]'
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
                            )
                        })}
                    </Text>
                </Text>
            </Text>
        </Text>
    )
}