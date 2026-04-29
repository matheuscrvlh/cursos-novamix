// COMPONENTS
import IndustryCard from "../../components/public/IndustryCard"

export default function AllIndustries({ industrias }) {
    return (
        <section className='w-[80vw] mx-auto pt-15'>

            {/* ======== FILTERS ======== */}
            <div
                className='
                    flex justify-between items-baseline-last pt-15 pb-5 w-[87%] mx-auto
                    md:w-[98%]
                '
            >
                <div>
                    <p
                        className='
                            text-lg font-bold text-gray-dark
                            md:text-3xl
                        '
                    >
                        NOSSOS PARCEIROS
                    </p>
                </div>
            </div>

            {/* ======== CURSOS ======== */}
            <div className='bg-gray flex justify-center w-full pb-20'>
                {industrias.length === 0 ? (
                    <div className='flex flex-col items-center justify-center w-full text-center mt-20'>
                        <p className='text-xl font-semibold'>
                            Nenhum curso encontrado.
                        </p>
                        <p>
                            Favor tente com outros filtros.
                        </p>
                    </div>
                ) : (
                    <div
                        className='
                            max-w-350 w-full justify-items-center bg-gray grid grid-cols-1 gap-8
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4
                            md:gap-6
                        '
                    >
                        {industrias.map(i => (
                            <IndustryCard
                                key={i.id}
                                id={i.id}
                                foto={i.foto}
                                razaoSocial={i.razaoSocial}
                                nome={i.nome}
                                cnpj={i.cnpj}
                                telefone={i.telefone}
                                email={i.email}
                                site={i.site}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}