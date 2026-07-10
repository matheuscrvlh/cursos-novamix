// REACT
import { useContext, useEffect, useState } from "react"

// COMPONENTS

// LAYOUT
import PublicLayout from "../../layouts/public/PublicLayout"

// HEAD 
import { Head } from '../../components/Head'

// SECTIONS
import AllCulinariansSections from "../../sections/culinarians/AllCulinariansSections"

// CONTEXT
import { DadosContext } from "../../contexts/DadosContext"

// IMAGES
import { bannerHome } from '../../assets/images/banner/'

export default function Culinarians() {

    // CONTEXT
    const {
        culinaristas
    } = useContext(DadosContext)

    // ROLAR TELA AO TOPO
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <section className='bg-gray mb-20'>

                {/* ================= CONTEUDO ================= */}
                <AllCulinariansSections culinaristas={culinaristas}/>

            </section>
        </PublicLayout>
    )
}