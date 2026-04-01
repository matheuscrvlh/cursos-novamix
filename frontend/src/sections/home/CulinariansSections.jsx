// REACT
import { Link } from 'react-router-dom'

// BANNERS
import { bannerCulinarista } from "../../assets/images/banner"

// COMPONENTS
import Text from "../../components/Text"
import Button from '../../components/Button'

export default function CulinariansSections({ culinaristas }) {

    return (
        <Text as='section' className='w-full mt-20 mb-25'>

            {/* ========== BANNER =========== */}
            <Text as='div' className='w-[99dvw]'>
                <Text as='img' src={bannerCulinarista} className='w-full'></Text>
            </Text>

            {/* ========== CULINARISTAS =========== */}
            <Text as='div' className='w-[80vw] mx-auto mt-20'>
                <Text as='p' className='
                    text-lg font-bold text-gray-dark
                    md:text-3xl
                '>
                    CULINARISTAS PARCEIRAS
                </Text>
                <Text as='div' className='grid grid-cols-4 gap-10 w-full h-full mt-5'>
                    {culinaristas.slice(0,4).map((c, i) => (
                        <Text as='div' key={i} className='h-full rounded-xl shadow-md'>
                            <Text as='div' className='w-auto h-80 rounded-t-xl'>
                                <Text as='img' src={c.foto} className='w-full h-full object-cover rounded-t-xl'/>
                            </Text>
                            <Text as='div' className='flex justify-between bg-white w-full rounded-b-xl p-4 items-center'> 
                                <Text as='p' className='font-semibold text-lg text-gray-dark'>{c.nomeCulinarista}</Text>
                                <Text as='p' className='bg-gray-base text-white rounded-2xl px-6 py-2'>{c.lojas.length === 2 ? 'Prado e Teresópolis' : c.lojas}</Text>
                            </Text>
                        </Text>
                    ))}
                </Text>
            </Text>

            {/* ========== BUTTON =========== */}
            <Text as='div' className='
                flex w-full justify-center mt-10
            '>  
                <Link to={'/culinaristas'}>
                    <Button className='
                        bg-orange-base text-white hover:bg-orange-light px-6 py-2 
                        cursor-pointer transition
                    '>
                        Ver mais
                    </Button>
                </Link>
            </Text>

        </Text>
    )
}