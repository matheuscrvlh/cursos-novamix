// COMPONENTS
import Text from "../../components/Text"
import CulinarianCard from "../../components/public/CulinarianCard"

export default function AllCulinariansSections({ culinaristas }) {

    return (
        <Text as='section' className='w-[80vw] mx-auto pt-15'>

            {/* ========== CULINARISTAS =========== */}
            <Text as='div' className='w-[80vw] mx-auto mt-20'>
                <Text as='p' className='
                    text-lg font-bold text-gray-dark
                    md:text-3xl
                '>
                    CULINARISTAS PARCEIROS
                </Text>
                <Text as='div' className='grid grid-cols-4 gap-10 w-full h-full mt-5'>
                    {culinaristas.map(c => (
                        <CulinarianCard
                            id={c.id}
                            foto={c.foto}
                            nomeCulinarista={c.nomeCulinarista}
                            lojas={c.lojas}
                        />
                    ))}
                </Text>
            </Text>

        </Text>
    )
}