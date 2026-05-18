// REACT
import { Link } from 'react-router-dom'

// BANNERS
import { bannerCulinarista } from "../../assets/images/banner"

// COMPONENTS
import Text from "../../components/Text"
import Button from '../../components/Button'
import CulinarianCard from '../../components/public/CulinarianCard'

export default function CulinariansSections({ 
    culinaristas,
    loadingCulinarian
}) {

    return (
        <Text as='section' className='w-full mt-20 mb-20'>

            {/* ========== BANNER =========== */}
            <Text as='div' className=' md:w-[99dvw]'>
                <Text as='img' src={bannerCulinarista} className='min-h-25 object-cover w-full'></Text>
            </Text>

            {/* ========== CULINARISTAS =========== */}
            <Text as='div' className='mt-10 md:mt-20 md:w-[80vw] md:mx-auto'>
                <Text as='p' className='
                    text-lg pl-10 font-bold text-gray-dark
                    md:text-3xl md:pl-0 md:px-2
                '>
                    CULINARISTAS PARCEIROS
                </Text>
                <Text as='div' className='flex overflow-x-auto gap-10 w-screen px-10 pb-5 h-full mt-5 md:w-full md:grid md:grid-cols-4 md:overflow-x-hidden md:px-1'>
                    {loadingCulinarian 
                        ? (
                            <Text 
                                as='div' 
                                className='
                                    flex flex-col items-center justify-center w-full text-center mt-25 mb-25
                            '>
                                <Text as='p' className='text-xl font-semibold'>Carregando...</Text>
                            </Text>
                            )
                        : culinaristas.slice(0,4).map(c => (
                        <CulinarianCard
                            id={c.id}
                            foto={c.foto}
                            nomeCulinarista={c.nomeCulinarista}
                            lojas={c.lojas}
                        />
                    ))}
                </Text>
            </Text>

            {/* ========== BUTTON =========== */}
            <Text as='div' className='
                flex w-full justify-center mt-5 md:mt-10
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