// COMPONENTS
import Text from "../../components/Text"
import IndustryCard from "../../components/public/IndustryCard"

export default function AllIndustries({
    industrias
}) {
    return (
        <Text as='section' className='w-[80vw] mx-auto pt-15'>

            {/* ======== FILTERS ======== */}
            <Text
                as='div'
                className='
                            flex justify-between items-baseline-last pt-15 pb-5 w-[87%] mx-auto
                            md:w-[98%]
                        '
            >
                <Text as='div'>
                    <Text as='p' className='
                                text-lg font-bold text-gray-dark
                                md:text-3xl
                            '>
                        NOSSOS PARCEIROS
                    </Text>
                </Text>
            </Text>

            {/* ======== CURSOS ======== */}
            <Text as='div' className='
                bg-gray flex justify-center w-full pb-20
            '>
                {industrias.length === 0
                    ? (<Text as='div' className='flex flex-col items-center justify-center w-full text-center mt-20'>
                        <Text as='p' className='text-xl font-semibold'>Nenhum curso encontrado.</Text>
                        <Text as='p'>Favor tente com outros filtros.</Text>
                    </Text>
                    ) : (
                        <Text
                            as='div'
                            className='
                            max-w-350 w-full justify-items-center bg-gray grid grid-cols-1 gap-8
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4
                            md:gap-6
                        '
                        >
                            {industrias.map(i => {
                                return (
                                    <IndustryCard
                                        id={i.id}
                                        foto={i.foto}
                                        razaoSocial={i.razaoSocial}
                                        nome={i.nome}
                                        cnpj={i.cnpj}
                                        telefone={i.telefone}
                                        email={i.email}
                                        site={i.site}
                                    />
                                );
                            })}
                        </Text>
                    )}
            </Text> 
        </Text>
    )
}