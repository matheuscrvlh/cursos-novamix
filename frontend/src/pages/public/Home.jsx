import Text from '../../components/Text'
import CourseCard from '../../components/public/CourseCard'
import PublicLayout from '../../layouts/public/PublicLayout'

// BD
import { courses } from '../../../../backend/data/data'

export default function Home() {
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
                    {courses.map(curso => (
                        <CourseCard key={curso.id} 
                            id={curso.id}
                            curso={curso.curso}
                            data={curso.data}
                            horario={curso.horario}
                            loja={curso.loja}
                            destaque={curso.destaque}
                        />
                    ))}  
                </Text>
            </Text>
        </PublicLayout>
    )
}