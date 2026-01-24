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
import { getAssentos } from '../../api/courses.service';

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function CoursesDashboard() {
    const {
        cursos,
        loading,
        addCourses,
        removeCourse,
        addCulinarian,
        removeCulinarian,
        culinaristas
    } = useContext(DadosContext);

    // ========= STATE VAGAS ========= 
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    // ====== FUNCOES
    // layout data
    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
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

    return (
        <Text as='section' className='flex flex-col gap-10'>
            {/* ======== INFO CARDS ==========*/}
            <Text as='section' className='w-full'>
                <Text as='article' className='flex gap-[6%]'>
                    <Text as='div' className='grid grid-cols-2 gap-3'>
                        <CardDash>
                            <Text>Cursos Ativos</Text>
                            {cursos.length}
                        </CardDash>
                        <CardDash>
                            <Text>Cursos Concluidos</Text>
                            {cursos.filter(c => {
                                c.data < new Date()
                                return c.length
                            })}
                        </CardDash>
                        <CardDash>
                            <Text>Cursos Hoje</Text>
                            <p>a</p>
                        </CardDash>
                        <CardDash>
                            <p>a</p>
                        </CardDash>
                    </Text>
                    <Text as='div' className='flex'>
                        <CardDash>
                            <p>a</p>
                        </CardDash>
                        <CardDash>
                            <p>a</p>
                        </CardDash>
                    </Text>
                </Text>
            </Text>
            {/* ======== CURSOS ==========*/}
            <Text as='section' className='flex flex-col gap-10'>
                <Text as='h2' className='font-bold text-gray-text text-2xl'>CURSOS</Text>
                <Text as='article' className='flex flex-col gap-5'>
                    <Text as='div'>
                        <Text
                            as='p'
                            className='text-gray-dark text-xl font-bold'
                        >
                            CATALOGO
                        </Text>
                        <Text
                            as='div'
                            className="
                                w-[78vw]
                                max-h-[600px]
                                flex
                                gap-4
                                overflow-x-auto
                                overflow-y-hidden
                                whitespace-nowrap
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
            <Text as='section' className='flex flex-col gap-10'>
                <Text as='h2' className='font-bold text-gray-text text-2xl'>CULINARISTAS</Text>
                <Text as='article' className='flex gap-[6%]'>
                    <CardDash width='30%' height='150px'>
                        <Text as='p' className='font-bold text-gray-text'>ATIVAS</Text>
                        <Text as='p' className='font-bold text-6xl text-gray-text text-center pt-1'>
                            {cursos.length}
                        </Text>
                    </CardDash>
                    <CardDash width='30%'>
                        <Text as='p' className='font-bold'>SEILA1</Text>
                    </CardDash>
                    <CardDash width='30%'>
                        <Text as='p' className='font-bold'>SEILA2</Text>
                    </CardDash>
                </Text>
                <Text as='article'>
                    <Text
                        as='p'
                        className='text-gray-dark text-xl font-bold'
                    >
                        CATALOGO
                    </Text>
                    <Text
                        as='div'
                        className="
                            w-[78vw]
                            max-h-[600px]
                            flex
                            gap-4
                            overflow-x-auto
                            overflow-y-hidden
                            whitespace-nowrap
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