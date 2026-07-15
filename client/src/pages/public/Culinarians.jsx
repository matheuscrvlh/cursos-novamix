import { useContext, useEffect, useState } from "react"

import PublicLayout from "../../layouts/public/PublicLayout"

import { Head } from '../../components/Head'

import AllCulinariansSections from "../../sections/culinarians/AllCulinariansSections"

import { DadosContext } from "../../contexts/DadosContext"

import { bannerHome } from '../../assets/images/banner/'

export default function Culinarians() {

    const {
        culinaristas
    } = useContext(DadosContext)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <section className='bg-gray mb-20'>

                <AllCulinariansSections culinaristas={culinaristas}/>

            </section>
        </PublicLayout>
    )
}
