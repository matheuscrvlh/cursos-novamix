// React 
import { useContext } from 'react';

// DB
import { DadosContext } from '../../contexts/DadosContext';

import Text from '../../components/Text'
import CourseCard from '../../components/public/CourseCard'
import PublicLayout from '../../layouts/public/PublicLayout'


export default function Home() {
    const { dados, loading } = useContext(DadosContext)

    return (
        <PublicLayout>
            <Text as='section'>
                <Text as='div' className='bg-blue-base w-full h-55'>
                    imagem
                </Text>
                <Text as='div' className='
                    bg-gray text-blue-base w-full text-center text-3xl 
                    font-bold pt-4
                '>
                    <Text as='h1'>Nossos Cursos</Text>
                </Text>
                <Text as='div' className='
                    bg-gray flex gap-3 justify-center pt-9 pb-50
                '>
                    {dados.map(curso => (
                        <CourseCard key={curso.id} 
                            id={curso.id}
                            curso={curso.nome}
                            data={curso.data}
                            horario={curso.hora}
                            loja={curso.loja}
                            destaque={curso.destaque}
                        />
                    ))}  
                </Text>
            </Text>
        </PublicLayout>
    )
}