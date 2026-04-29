// REACT
import { Link } from 'react-router-dom'

// BANNERS
import { bannerCulinarista } from "../../assets/images/banner"

// COMPONENTS
import Button from '../../components/Button'
import CulinarianCard from '../../components/public/CulinarianCard'

export default function CulinariansSections({ culinaristas }) {
    return (
        <section className='w-full mt-20 mb-20'>

            {/* ========== BANNER =========== */}
            <div className='md:w-[99dvw]'>
                <img
                    src={bannerCulinarista}
                    alt="Banner culinária"
                    className='min-h-25 object-cover w-full'
                />
            </div>

            {/* ========== CULINARISTAS =========== */}
            <div className='mt-10 md:mt-20 md:w-[80vw] md:mx-auto'>
                <p
                    className='
                        text-lg pl-10 font-bold text-gray-dark
                        md:text-3xl md:pl-0 md:px-2
                    '
                >
                    CULINARISTAS PARCEIROS
                </p>

                <div
                    className='
                        flex overflow-x-auto gap-10 w-screen px-10 pb-5 h-full mt-5
                        md:w-full md:grid md:grid-cols-4 md:overflow-x-hidden md:px-1
                    '
                >
                    {culinaristas.slice(0, 4).map(c => (
                        <CulinarianCard
                            key={c.id}
                            id={c.id}
                            foto={c.foto}
                            nomeCulinarista={c.nomeCulinarista}
                            lojas={c.lojas}
                        />
                    ))}
                </div>
            </div>

            {/* ========== BUTTON =========== */}
            <div className='flex w-full justify-center mt-5 md:mt-10'>
                <Link to='/culinaristas'>
                    <Button
                        className='
                            bg-orange-base text-white hover:bg-orange-light px-6 py-2 
                            cursor-pointer transition
                        '
                    >
                        Ver mais
                    </Button>
                </Link>
            </div>
        </section>
    )
}