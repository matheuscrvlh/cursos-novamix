import Text from '../../components/Text'
import CourseCard from '../../components/CourseCard'
import PublicLayout from '../../layouts/public/PublicLayout'


export default function Home() {
    const cursos = [
        {
            id: '1',
            curso: 'Bolo',
            data: '15/01/2025',
            horario: '15',
            loja: 'prado',
            destaque: 'confeitaria'
        },
        {
            id: '2',
            curso: 'Salgado',
            data: '14/01/2025',
            horario: '12',
            loja: 'teresopolis',
            destaque: 'panificadora'
        },
        {
            id: '3',
            curso: 'Torta Salgada',
            data: '14/01/2025',
            horario: '12',
            loja: 'teresopolis',
            destaque: 'panificadora'
        },
        
    ]

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
                    {cursos.map(curso => (
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