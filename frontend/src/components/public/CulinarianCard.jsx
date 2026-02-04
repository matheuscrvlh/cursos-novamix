import Text from "../Text"

export default function CulinarianCard({
    imagem,
    culinarista,
    industria,
    telefone,
    instagram,
    lojas,
    cursos,
    className,
    onClick

}) {
    return (
        <Text
            as='div'
            className={`bg-white rounded-xl max-w-[300px] min-w-[250px] min-h-[380px] flex flex-col shadow-md
             hover:shadow-lg transition-shadow
             ${className || ''}`}
        >
            <Text as='div' className='relative rounded-md h-[200px] overflow-hidden'>
                <Text 
                    as='p'
                    className='absolute top-2 text-white right-2 bg-orange-base rounded-md p-2 text-sm md:text-base font-semibold z-10'
                >
                    {`${culinarista}`}
                </Text>
                {imagem ? (
                    <Text
                        as='img'
                        src={imagem}
                        alt={culinarista}
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
                className='text-blue-base font-bold text-xl md:text-2xl p-4 line-clamp-2'
            >
                {culinarista}
            </Text>

            <Text as='div' className='mt-auto p-4 pt-0'>
                <Text as='p' className='text-gray-dark text-sm md:text-base mb-1'>
                    {`${industria}`}
                </Text>
                <Text as='p' className='text-gray-dark text-sm md:text-base mb-1'>
                    {`${lojas}`}
                </Text>
                <Text as='p' className='text-gray-dark text-sm md:text-base mb-1'>
                    {`${cursos}`}
                </Text>

                <Text
                    as='button'
                    className='bg-orange-base rounded-sm p-2 md:p-3 w-full mt-3 text-white text-sm md:text-base font-semibold cursor-pointer hover:bg-orange-light hover:shadow-md transition-all'
                    onClick={onClick ? onClick : null}
                >
                    Ver detalhes
                </Text>
                <Text as='p' className='text-gray-dark text-center text-sm md:text-base mt-2'>
                    {`${telefone} - ${instagram}`}
                </Text>
            </Text>
        </Text>
    )
}