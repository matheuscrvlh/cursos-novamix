import Text from '../components/Text'

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
        <Text as='main'>
            <Text as='header' className='w-full'>
                <Text as='div' className=' bg-orange-light w-full h-15'>

                </Text>
                <Text as='div' className=' bg-orange-base w-full h-30'>

                </Text>
                <Text as='div' className='bg-gray w-full h-10'></Text>
            </Text>
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
                        <Text as='div' className='
                            bg-white rounded-xl w-70 h-80 p-4
                        '>
                            <Text as='div' className='
                                bg-orange-base rounded-md h-40
                            '>
                                <h1>image</h1>
                            </Text>
                            <Text as='h1' className='
                                text-blue-base font-bold text-2xl mt-3
                            '>
                                {curso.curso}
                            </Text>
                            <Text as='div'>
                                <Text as='p'>
                                    {`${curso.data} - ${curso.horario}h`}
                                </Text>
                                <Text as='p'>
                                    {`Loja: ${curso.loja}`}
                                </Text>
                                <Text as='button' className='bg-orange-base rounded-sm p-2 w-62'>
                                    Garantir minha vaga
                                </Text>
                            </Text>
                        </Text>
                    ))}
                    
                </Text>
            </Text>
        </Text>
    )
}