// COMPONENTS
import CulinarianCard from "../../components/public/CulinarianCard"

export default function AllCulinariansSections({ culinaristas }) {

    return (
        <section className='w-[80vw] mx-auto pt-15'>

            {/* ========== CULINARISTAS =========== */}
            <div className='w-[80vw] mx-auto'>
                <p
                    className='
                        text-lg font-bold text-gray-dark
                        md:text-3xl
                    '
                >
                    CULINARISTAS PARCEIROS
                </p>

                <div
                    className='
                        grid grid-cols-1 gap-10 w-full h-full mt-5
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                    '
                >
                    {culinaristas.map(c => (
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

        </section>
    )
}