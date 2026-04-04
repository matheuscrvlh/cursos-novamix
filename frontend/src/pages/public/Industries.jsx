// REACT
import { useContext, useEffect, useState } from "react"

// COMPONENTS
import Text from "../../components/Text"

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

    // CONTEXT
    const {
        industrias
    } = useContext(DadosContext)

    // ROLAR TELA AO TOPO
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <Text as='section' className='bg-gray mb-20'>

                {/* ================= CONTEUDO ================= */}
                <AllIndustries industrias={industrias}/>

            </Text>
        </PublicLayout>
    )
}