// React 
import { useContext } from 'react';

// DB
import { DadosContext } from '../../contexts/DadosContext';

// Components
import Text from '../../components/Text'
import CourseCard from '../../components/public/CourseCard'

//Layouts
import PublicLayout from '../../layouts/public/PublicLayout'

// Images
import { bannerHome } from '../../assets/images/banner/'


export default function Home() {
    const { dados, loading } = useContext(DadosContext)

    return (
        <PublicLayout>
            <Text as='section'>
                <Text 
                    as='a'
                    href='#cursos'
                >
                    <Text as='img' src={bannerHome} alt='banner' className='bg-blue-base w-full h-[220px] '/>
                </Text>
                <Text as='div' className='
                    bg-gray text-blue-base w-full text-center text-3xl 
                    font-bold pt-12 
                '>
                    <Text as='h1' id='cursos'>Nossos Cursos</Text>
                </Text>
                <Text as='div' className='
                    bg-gray flex justify-center gap-3 w-full justify-center pt-6 pb-30
                '>
                    <Text as='div' className='max-w-[80vw] bg-gray flex flex-wrap justify-center gap-3'>
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
            </Text>
        </PublicLayout>
    )
}