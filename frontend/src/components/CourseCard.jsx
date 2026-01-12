import Text from './Text'
import { imagem } from '../assets/images/courses/index'

export default function CourseCard({
    id,
     curso,
      data,
       horario,
        loja,
         destaque 
    }) {

    return (
        <Text as='div' className='
            bg-white rounded-xl w-70 min-h-80 p-4
        '>
            <Text as='div' className='
                rounded-md h-40
            '>
               <Text as='img' src={imagem} alt='Bolo' className='rounded-md'/>
            </Text>
            <Text as='h1' className='
                text-blue-base font-bold text-2xl mt-3
            '>
                {`${id} ${curso} ${destaque}`}
            </Text>
            <Text as='div'>
                <Text as='p'>
                    {`${data} - ${horario}h`}
                </Text>
                <Text as='p'>
                    {`Loja: ${loja}`}
                </Text>
                <Text as='button' className='bg-orange-base rounded-sm p-2 w-62'>
                    Garantir minha vaga
                </Text>
            </Text>
        </Text>
    )
}