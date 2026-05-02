// COMPONENTS
import Text from "../../components/Text"

export default function IndustriesSections({ industrias }) {
    return (
        <Text as='section' className='md:w-[80vw] md:mx-auto'>

            {/* ========== INDUSTRIAS =========== */}
            <Text as='div'>
                <Text as='p' className='
                    text-lg font-bold text-gray-dark px-10
                    md:text-3xl md:px-0
                '>
                    INDUSTRIAS PARCEIRAS
                </Text>
                <Text 
                    as='div' 
                    className='
                        flex w-full gap-5 mt-5 overflow-x-auto px-10
                        md:grid md:grid-flow-col md:grid-rows-2 md:overflow-x-hidden md:px-10
                '>
                    {industrias.slice(0, 16).map((industria, i) => (
                        <Text as='div' key={i}>
                            <Text as='div'>
                                <Text as='img' src={industria.foto} className='w-full min-w-30 min-h-20 max-w-40 max-h-30'/>
                            </Text>
                        </Text>
                    ))}
                </Text>
            </Text>
        </Text>
    )
}