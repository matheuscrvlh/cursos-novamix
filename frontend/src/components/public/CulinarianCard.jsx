export default function CulinarianCard({
    id,
    foto,
    nomeCulinarista,
    lojas,
    ...props
}) {
    return (
        <div
            key={id}
            className={`${props} h-full rounded-xl shadow-md hover:shadow-lg transition`}
        >
            <div className='min-w-73 w-full h-80 rounded-t-xl'>
                <img
                    src={foto}
                    alt={nomeCulinarista}
                    className='w-full h-full object-cover rounded-t-xl'
                />
            </div>

            <div className='flex justify-between bg-white w-full rounded-b-xl p-4 items-center'>
                <p className='font-semibold text-sm text-gray-dark md:text-lg'>
                    {nomeCulinarista}
                </p>

                <p className='bg-gray-base text-white text-sm rounded-2xl px-3 py-2 md:px-6'>
                    {lojas.length === 2 ? 'Prado e Teresópolis' : lojas}
                </p>
            </div>
        </div>
    )
}