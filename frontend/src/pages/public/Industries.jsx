// REACT
import { useContext, useEffect } from "react"

// LAYOUT
import PublicLayout from "../../layouts/public/PublicLayout"

// HEAD 
import { Head } from '../../components/Head'

// SECTIONS
import AllIndustries from "../../sections/industries/AllIndustries"

// CONTEXT
import { DadosContext } from "../../contexts/DadosContext"

// IMAGES
import { bannerHome } from '../../assets/images/banner'

export default function Culinarians() {

    const { industrias } = useContext(DadosContext)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />

            <section className='bg-gray mb-20'>
                <AllIndustries industrias={industrias} />
            </section>

        </PublicLayout>
    )
}