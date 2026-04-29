// COMPONENTS
import CourseCard from "../../components/public/CourseCard";

// ICONS
import { Menu } from "lucide-react";

export default function AllCoursesSections({
    cursosFiltrados,
    vagasPorCurso,
    openForm,
    showModalFilters,
    setShowModalFilters
}) {

    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <section className='w-[80vw] mx-auto pt-10 md:pt-15'>

            {/* ======== FILTERS ======== */}
            <div
                className='
                    flex justify-between items-baseline-last pb-5 mx-auto
                    md:w-[80%]
                '
            >
                <div>
                    <p
                        className='
                            text-lg font-bold text-gray-dark
                            md:text-3xl
                        '
                    >
                        NOSSOS CURSOS
                    </p>
                </div>

                <button
                    onClick={() => setShowModalFilters(prev => !prev)}
                    className='
                        flex gap-2 items-center text-white bg-orange-base px-3 py-2 rounded-xl font-bold
                        hover:bg-orange-light transition
                        md:px-7 md:py-2
                    '
                >
                    <p>Filtros</p>
                    <Menu className='w-6 h-6' />
                </button>
            </div>

            {/* ======== CURSOS ======== */}
            {cursosFiltrados.length === 0 ? (
                <div
                    className='
                        flex flex-col items-center justify-center w-full text-center mt-25
                    '
                >
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
                        bg-gray grid grid-cols-1 gap-10 justify-items-center
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                    '
                >
                    {cursosFiltrados.map(curso => {
                        const vagas = vagasPorCurso[curso.id] || { livres: 0, reservadas: 0 };

                        return (
                            <CourseCard
                                key={curso.id}
                                id={curso.id}
                                curso={curso.nomeCurso}
                                data={layoutData(curso.data)}
                                horario={curso.hora}
                                loja={curso.loja}
                                culinarista={curso.culinarista}
                                duracao={curso.duracao}
                                categoria={curso.categoria}
                                vagasLivres={vagas.livres}
                                vagasReservadas={vagas.reservadas}
                                valor={curso.valor}
                                onClick={() => openForm(curso.id)}
                                className='w-full max-w-[380px]'
                                imagem={curso.fotos?.length ? curso.fotos[0] : null}
                            />
                        );
                    })}
                </div>
            )}

        </section>
    )
}