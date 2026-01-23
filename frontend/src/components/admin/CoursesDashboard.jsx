// React
import { useContext, useState, useEffect } from 'react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';

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

    // ====== FUNCOES
    // layout data
    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

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
                <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                    <Text as='p' className='font-bold text-xl mb-3 text-gray-text'>CURSOS ATIVOS</Text>
                    <Text as='div' className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] font-bold text-gray-text'>
                        <Text as='p'>DESCRIÇÃO</Text>
                        <Text as='p'>CULINARISTA</Text>
                        <Text as='p'>VALOR</Text>
                        <Text as='p'>DATA</Text>
                        <Text as='p'>HORARIO</Text>
                        <Text as='p'>LOJA</Text>
                        <Text as='p'>FUNÇÕES</Text>
                    </Text>
                    {loading ? (
                        <Text as='p'>Carregando cursos...</Text>
                    ) : (
                        cursos.map(curso => (
                        <Text as='div' className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] text-gray-text mt-3' key={curso.id}>
                            <Text as='p'>{curso.nomeCurso}</Text>
                            <Text as='p'>{curso.culinarista}</Text>
                            <Text as='p'>{curso.valor}</Text>
                            <Text as='p'>{layoutData(curso.data)}</Text>
                            <Text as='p'>{curso.hora}</Text>
                            <Text as='p'>{curso.loja}</Text>
                                
                            <Button 
                                className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                onClick={() => removeCourse(curso.id)}
                            >
                                Excluir
                            </Button>
                        </Text>
                    )))}
                </CardDash>
                <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                    <Text as='div' className='font-bold text-gray-text'>
                        <Text>CULINARISTAS ATIVAS</Text>
                        <Text as='div' className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] text-gray-text mt-3'>
                            <Text as='p'>NOME</Text>
                            <Text as='p'>INDUSTRIA</Text>
                            <Text as='p'>TELEFONE</Text>
                            <Text as='p'>INSTAGRAM</Text>
                            <Text as='p'>LOJAS</Text>
                            <Text as='p'>CADASTRO</Text>
                            <Text as='p'>FUNÇOES</Text>
                        </Text>
                        <Text as='div'>
                            {culinaristas.map(c => (
                                <Text 
                                    as='div' 
                                    className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] text-gray-text mt-3'
                                    key={c.id}
                                >
                                    <Text as='p'>{c.nomeCulinarista}</Text>
                                    <Text as='p'>{c.industria}</Text>
                                    <Text as='p'>{c.telefone}</Text>
                                    <Text as='p'>{c.instagram}</Text>
                                    <Text as='p'>{c.lojas}</Text>
                                    <Text as='p'>{c.dataCadastro}</Text>
                                    <Button 
                                        className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                        onClick={() => removeCulinarian(c.id)}
                                    >
                                        Excluir
                                    </Button>
                                </Text>
                            ))}
                        </Text>
                    </Text>
                </CardDash>
            </Text>
        </Text>
    )
}