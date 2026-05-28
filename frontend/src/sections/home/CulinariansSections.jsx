// REACT
import { Link } from 'react-router-dom'

// BANNERS
import { bannerCulinarista } from "../../assets/images/banner"

// COMPONENTS
import Button from '../../components/Button'
import CulinarianCard from '../../components/public/CulinarianCard'

export default function CulinariansSections({ 
    culinaristas,
    loadingCulinarian
}) {

    return (
        <section className='w-full mt-20 mb-20'>

            {/* ========== BANNER =========== */}
            <div className=' md:w-[99dvw]'>
                <img src={bannerCulinarista} className='min-h-25 object-cover w-full'></img>
            </div>

            {/* ========== CULINARISTAS =========== */}
            <div className='mt-10 md:mt-20 md:w-[80vw] md:mx-auto'>
                <p className='
                    text-lg pl-10 font-bold text-gray-dark mb-5
                    md:text-3xl md:pl-0 md:px-2
                '>
                    CULINARISTAS PARCEIROS
                </p>
                <div className='flex overflow-x-auto gap-10 px-10 pb-5 md:grid md:grid-cols-4 md:overflow-x-hidden md:gap-5 md:px-1'>
                    {loadingCulinarian
                        ? (
                            <div className='flex flex-col items-center justify-center w-full text-center mt-25 mb-25'>
                                <p className='text-xl font-semibold'>Carregando...</p>
                            </div>
                        )
                        : culinaristas.slice(0, 4).map(c => (
                            <CulinarianCard
                                key={c.id}
                                id={c.id}
                                foto={c.foto}
                                nomeCulinarista={c.nomeCulinarista}
                                lojas={c.lojas}
                                className='min-w-52 max-w-xs md:min-w-0 md:max-w-none'
                            />
                        ))
                    }
                </div>
            </div>

            {/* ========== BUTTON =========== */}
            <div className='
                flex w-full justify-center mt-5 md:mt-10
            '>  
                <Link to={'/culinaristas'}>
                    <Button className='bg-orange-base text-white hover:bg-orange-light text-sm px-5 py-1.5 sm:px-6 sm:py-2 cursor-pointer transition'>
                        Ver mais
                    </Button>
                </Link>
            </div>

        </section>
    )
}