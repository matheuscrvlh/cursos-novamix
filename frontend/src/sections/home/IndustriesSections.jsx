// COMPONENTS
import Text from "../../components/Text"

export default function IndustriesSections({ industrias }) {
    return (
        <Text as='section' className='w-[80vw] mx-auto'>

            {/* ========== INDUSTRIAS =========== */}
            <Text as='div'>
                <Text as='p' className='
                    text-lg font-bold text-gray-dark
                    md:text-3xl
                '>
                    INDUSTRIAS PARCEIRAS
                </Text>
                <Text as='div' className='grid grid-flow-col grid-rows-2 w-full gap-5 mt-5'>
                    {industrias.slice(0, 16).map((industria, i) => (
                        <Text as='div' key={i}>
                            <Text as='div'>
                                <Text as='img' src={industria.foto} className='w-60'/>
                            </Text>
                        </Text>
                    ))}
                </Text>
            </Text>
        </Text>
    )
}