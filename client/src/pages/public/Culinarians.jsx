import { useContext } from "react"

import PublicLayout from "../../layouts/public/PublicLayout"

import { Head } from '../../components/Head'

import AllCulinariansSections from "../../sections/culinarians/AllCulinariansSections"

import { DadosContext } from "../../contexts/DadosContext"

import { bannerHome } from '../../assets/images/banner/'

export default function Culinarians() {

    const {
        culinaristas,
        loadingCulinarian
    } = useContext(DadosContext)

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Culinaristas' />
            <section className='bg-gray mb-20'>

                <AllCulinariansSections culinaristas={culinaristas} loadingCulinarian={loadingCulinarian} />

            </section>
        </PublicLayout>
    )
}
