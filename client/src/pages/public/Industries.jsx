import { useContext } from "react"

import PublicLayout from "../../layouts/public/PublicLayout"

import { Head } from '../../components/Head'

import AllIndustries from "../../sections/industries/AllIndustries"

import { DadosContext } from "../../contexts/DadosContext"

import { bannerHome } from '../../assets/images/banner'

export default function Industries() {

    const {
        industrias,
        loadingIndustries
    } = useContext(DadosContext)

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Indústrias | Novamix Cursos' />
            <section className='bg-gray mb-20'>

                <AllIndustries industrias={industrias} loadingIndustries={loadingIndustries} />

            </section>
        </PublicLayout>
    )
}
