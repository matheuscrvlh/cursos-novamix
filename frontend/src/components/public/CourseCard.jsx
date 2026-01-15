import Text from '../Text'
import { imagem } from '../../assets/images/courses/'

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
            bg-white rounded-xl w-70 min-h-[380px] p-4 flex flex-col shadow-md
        '>
            <Text as='div' className='
                rounded-md h-40
            '>
               <Text as='img' src={imagem} alt='Bolo' className='rounded-md'/>
            </Text>
            <Text as='h1' className='
                text-blue-base font-bold text-2xl mt-3
            '>
                {`${curso}`}
            </Text>
            <Text as='div' className='mt-auto'>
                <Text as='p' className='text-gray-dark'>
                    {`${data} - ${horario}h`}
                </Text>
                <Text as='p' className='text-gray-dark'>
                    {`Loja: ${loja}`}
                </Text>
                <Text as='button' className='bg-orange-base rounded-sm p-2 w-62 mt-3 text-white font-semibold cursor-pointer hover:bg-orange-light hover:shadow-md'>
                    Garantir minha vaga
                </Text>
            </Text>
        </Text>
    )
}