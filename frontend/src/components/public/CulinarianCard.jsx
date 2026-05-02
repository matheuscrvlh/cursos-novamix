// COMPONENTS
import Text from "../Text"

export default function CulinarianCard({
    id,
    foto,
    nomeCulinarista,
    lojas,
    ...props
}) {
    return (
        <Text as='div' key={id} className={`${props}h-full rounded-xl shadow-md hover:shadow-lg transition`}>
            <Text as='div' className='min-w-73 w-full h-80 rounded-t-xl'>
                <Text as='img' src={foto} className='w-full h-full object-cover rounded-t-xl'/>
            </Text>
            <Text as='div' className='flex justify-between bg-white w-full rounded-b-xl p-4 items-center'> 
                <Text as='p' className='font-semibold text-sm text-gray-dark md:text-lg'>{nomeCulinarista}</Text>
                <Text as='p' className='bg-gray-base text-white text-sm rounded-2xl px-3 py-2 md:px-6'>{lojas.length === 2 ? 'Prado e Teresópolis' : lojas}</Text>
            </Text>
        </Text>
    )
}