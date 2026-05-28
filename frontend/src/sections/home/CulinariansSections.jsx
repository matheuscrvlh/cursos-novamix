// REACT
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// BANNERS
import { bannerCulinarista } from "../../assets/images/banner"

// COMPONENTS
import Button from '../../components/Button'
import CulinarianCard from '../../components/public/CulinarianCard'

// SERVICES
import { getBanners } from '../../api/banners.services'

export default function CulinariansSections({
    culinaristas,
    loadingCulinarian
}) {
    const [homeBanners, setHomeBanners] = useState([])
    const [homeIndex, setHomeIndex]     = useState(0)

    useEffect(() => {
        getBanners('home').then(data => {
            if (Array.isArray(data) && data.length > 0) {
                setHomeBanners(data.filter(b => b.ativo))
            }
        })
    }, [])

    useEffect(() => {
        if (homeBanners.length <= 1) return
        const t = setInterval(() => setHomeIndex(i => (i + 1) % homeBanners.length), 5000)
        return () => clearInterval(t)
    }, [homeBanners.length])

    return (
        <section className='w-full mt-20 mb-20'>

            {/* ========== BANNER — padrão 1920×480 (4:1) =========== */}
            <div className='md:w-[99dvw]'>
                {homeBanners.length > 0 ? (
                    <div className='relative w-full overflow-hidden aspect-425/495 md:aspect-4/1'>
                        {homeBanners.map((b, i) => {
                            const visible = i === homeIndex
                            const wrapStyle = {
                                position: 'absolute', inset: 0,
                                opacity: visible ? 1 : 0,
                                transition: 'opacity 0.7s',
                                pointerEvents: visible ? 'auto' : 'none',
                            }
                            const media = (
                                <picture style={{ display: 'block', width: '100%', height: '100%' }}>
                                    <source media='(min-width: 768px)' srcSet={b.imagem} />
                                    <img src={b.imagem_mobile ?? b.imagem} className='w-full h-full object-cover' alt='' />
                                </picture>
                            )
                            return b.link
                                ? <a key={b.id} href={b.link} target='_blank' rel='noopener noreferrer' style={wrapStyle}>{media}</a>
                                : <div key={b.id} style={wrapStyle}>{media}</div>
                        })}
                        {homeBanners.length > 1 && (
                            <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10'>
                                {homeBanners.map((_, i) => (
                                    <button key={i} onClick={() => setHomeIndex(i)}
                                        className={`h-2 rounded-full transition-all cursor-pointer ${i === homeIndex ? 'w-4 bg-white' : 'w-2 bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='w-full overflow-hidden aspect-425/495 md:aspect-4/1'>
                        <img src={bannerCulinarista} className='w-full h-full object-cover' alt='' />
                    </div>
                )}
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