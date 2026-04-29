export default function IndustriesSections({ industrias }) {
    return (
        <section className='md:w-[80vw] md:mx-auto'>

            {/* ========== INDUSTRIAS =========== */}
            <div>
                <p
                    className='
                        text-lg font-bold text-gray-dark px-10
                        md:text-3xl md:px-0
                    '
                >
                    INDUSTRIAS PARCEIRAS
                </p>

                <div
                    className='
                        flex w-full gap-5 mt-5 overflow-x-auto px-10
                        md:grid md:grid-flow-col md:grid-rows-2 md:overflow-x-hidden md:px-10
                    '
                >
                    {industrias.slice(0, 16).map((industria) => (
                        <div key={industria.id}>
                            <div>
                                <img
                                    src={industria.foto}
                                    alt={industria.nome || "Indústria parceira"}
                                    className='w-full min-w-30 min-h-20 max-w-40 max-h-30'
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    )
}