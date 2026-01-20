import Text from '../Text';

export default function CourseCard({
    curso,
    data,
    horario,
    loja,
    imagem,
    culinarista,
    duracao,
    categoria,
    valor,
    vagasLivres,
    vagasReservadas,
    onClick
}) {
    return (
        <Text
            as='div'
            className='bg-white rounded-xl w-70 min-h-[380px] flex flex-col shadow-md'
        >
            <Text as='div' className='relative rounded-md h-full overflow-hidden'>
                <Text 
                    as='p'
                    className='absolute top-1 text-white right-1 bg-orange-base rounded-md p-2 w-auto'
                >
                    {`${valor} R$`}
                </Text>
                {imagem ? (
                    <Text
                        as='img'
                        src={imagem}
                        alt={curso}
                        className='rounded-t-md w-full h-full object-cover'
                    />
                ) : (
                    <Text
                        as='div'
                        className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-500'
                    >
                        Sem imagem
                    </Text>
                )}
            </Text>

            <Text
                as='h1'
                className='text-blue-base font-bold text-2xl p-4'
            >
                {curso}
            </Text>

            <Text as='div' className='mt-auto p-4'>
                <Text as='p' className='text-gray-dark'>
                    {`${data} - ${horario}h`}
                </Text>
                <Text as='p' className='text-gray-dark'>
                    {`Duração: ${duracao}`}
                </Text>
                <Text as='p' className='text-gray-dark'>
                    {`Loja: ${loja}`}
                </Text>
                <Text as='p' className='text-gray-dark'>
                    {`Culinarista: ${culinarista}`}
                </Text>

                <Text
                    as='button'
                    className='bg-orange-base rounded-sm p-2 w-62 mt-3 text-white font-semibold cursor-pointer hover:bg-orange-light hover:shadow-md'
                    onClick={onClick}
                >
                    Garantir minha vaga
                </Text>
                <Text as='p' className='text-gray-dark text-center'>
                    {`Vagas: ${vagasLivres}/24`}
                </Text>
            </Text>
        </Text>
    );
}
