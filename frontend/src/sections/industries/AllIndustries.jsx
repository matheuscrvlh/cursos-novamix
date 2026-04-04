// COMPONENTS
import Text from "../../components/Text"
import IndustryCard from "../../components/public/IndustryCard"

export default function AllIndustries({
    industrias
}) {
    return (
        <Text as='section' className='w-[80vw] mx-auto pt-15'>
            <IndustryCard industrias={industrias}/>
        </Text>
    )
}