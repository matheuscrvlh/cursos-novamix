import { useContext, useEffect, useState } from "react"

import PublicLayout from "../../layouts/public/PublicLayout"

import { Head } from '../../components/Head'

import AllIndustries from "../../sections/industries/AllIndustries"

import { DadosContext } from "../../contexts/DadosContext"

import { bannerHome } from '../../assets/images/banner'

export default function Culinarians() {

    const {
        industrias
    } = useContext(DadosContext)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [])

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Loja Novamix | Cursos' />
            <section className='bg-gray mb-20'>

                <AllIndustries industrias={industrias}/>

            </section>
        </PublicLayout>
    )
}
