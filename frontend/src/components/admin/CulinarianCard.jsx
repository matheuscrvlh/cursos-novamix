export default function CulinarianCard({
    imagem,
    culinarista,
    industria,
    telefone,
    instagram,
    lojas,
    cursos,
    className = '',
    onClick
}) {
    return (
        <div
            className={`bg-white rounded-xl max-w-[300px] min-w-[250px] min-h-[380px] flex flex-col shadow-md
            hover:shadow-lg transition-shadow
            ${className}`}
        >
            <div className='relative rounded-md h-[200px] overflow-hidden'>
                <p className='absolute top-2 right-2 text-white bg-orange-base rounded-md p-2 text-sm md:text-base font-semibold z-10'>
                    {culinarista}
                </p>

                {imagem ? (
                    <img
                        src={imagem}
                        alt={culinarista || 'Imagem do culinarista'}
                        className='rounded-t-md w-full h-full object-cover'
                    />
                ) : (
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-500'>
                        Sem imagem
                    </div>
                )}
            </div>

            <h2 className='text-blue-base font-bold text-xl md:text-2xl p-4 line-clamp-2'>
                {culinarista}
            </h2>

            <div className='mt-auto p-4 pt-0'>
                <p className='text-gray-dark text-sm md:text-base mb-1'>
                    {industria}
                </p>

                <p className='text-gray-dark text-sm md:text-base mb-1'>
                    {lojas}
                </p>

                <p className='text-gray-dark text-sm md:text-base mb-1'>
                    {cursos}
                </p>

                <button
                    className='bg-orange-base rounded-sm p-2 md:p-3 w-full mt-3 text-white text-sm md:text-base font-semibold cursor-pointer hover:bg-orange-light hover:shadow-md transition-all'
                    onClick={onClick}
                >
                    Ver detalhes
                </button>

                <p className='text-gray-dark text-center text-sm md:text-base mt-2'>
                    {`${telefone} - ${instagram}`}
                </p>
            </div>
        </div>
    )
}