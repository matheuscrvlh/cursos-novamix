import Text from "../Text"

export default function IndustryCard({
    id,
    foto,
    razaoSocial,
    nome,
    cnpj,
    telefone,
    email,
    site,
    ...props

}) {
    return (
        <Text as='div' key={id} className={`
            ${props} bg-white rounded-xl p-5 shadow-md
            w-75
            max-w-150
            min-h-[380px]
            max-h-[550px]
            flex
            flex-col
            hover:shadow-lg
            transition-shadow
            md:min-w-[300px]
        `}>
            <Text as='div' className='relative rounded-t-xl h-[200px] overflow-hidden bg-gray-base'>
                <Text as='img' src={foto} alt='Imagem Industria' className='w-full h-full object-cover'/>
            </Text>
            <Text as='div' className='rounded-b-xl mt-5'>
                <Text as='p' className='font-semibold'>{razaoSocial}</Text>
                <Text as='p' className='font-semibold text-2xl mt-2'>{nome}</Text>
                <Text as='p' className='font-semibold'>{cnpj}</Text>
                <Text as='p' className='mt-5'>Tel: {telefone}</Text>
                <Text as='p'>Email: {email}</Text>
                <Text as='a' href={site} target='_blank' className='text-blue-base'>{site}</Text>
            </Text>
        </Text>
    )
}