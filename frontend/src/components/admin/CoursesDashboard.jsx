// React
import { useContext, useState, useEffect } from 'react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import CourseCard from '../../components/public/CourseCard'

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
        <Text>
            <Text as='article' className='flex gap-[6%] mb-15'>
                <CardDash width='30%' height='150px'>
                    <Text as='p' className='font-bold text-gray-text'>CURSOS ATIVOS</Text>
                    <Text as='p' className='font-bold text-6xl text-gray-text text-center pt-1'>
                    {cursos.length}
                    </Text>
                </CardDash>
                <CardDash width='30%'>
                    <Text as='p' className='font-bold'>INCRIÇÕES TOTAIS</Text>
                </CardDash>
                <CardDash width='30%'>
                    <Text as='p' className='font-bold'>SEILA</Text>
                </CardDash>
            </Text>
            <Text as='article' className='flex flex-col gap-10'>
                <Text>CATALOGO DE CURSOS</Text>
                <Text 
                    as='div'
                    className="
                        w-[70vw]
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
    )
}