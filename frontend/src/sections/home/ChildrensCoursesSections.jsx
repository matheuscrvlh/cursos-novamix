// REACT
import { Link } from 'react-router-dom'

// COMPONENTS
import Button from "../../components/Button";
import CourseCard from "../../components/public/CourseCard";

// ICONS
import { Menu } from "lucide-react";

export default function ChildrensCoursesSections({
    cursosInfantisFiltrados,
    vagasPorCursoInfantil,
    openForm,
    showModalFilters,
    setShowModalFilters
}) {

    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <section className='md:w-[80vw] md:mx-auto'>

            {/* ======== FILTERS ======== */}
            <div
                className='
                    flex justify-between items-baseline-last pb-5 w-[80%] mx-auto
                    md:w-[80vw]
                '
            >
                <div>
                    <p
                        className='
                            text-lg font-bold text-gray-dark
                            md:text-3xl md:px-1
                        '
                    >
                        CURSOS INFANTIS
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
            <div className='bg-gray flex justify-center w-full pb-7 md:pb-10'>
                {cursosInfantisFiltrados.length === 0 ? (
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
                            bg-gray flex overflow-x-auto gap-10 justify-items-center
                            px-10 pb-3
                            sm:grid sm:grid-cols-2 sm:overflow-x-hidden sm:px-2 sm:pb-4
                            lg:grid-cols-3
                            xl:grid-cols-4
                        '
                    >
                        {cursosInfantisFiltrados.slice(0, 4).map(curso => {
                            const vagas = vagasPorCursoInfantil[curso.id] || { livres: 0, reservadas: 0 };

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
                                    className='w-full min-w-73 max-w-[380px]'
                                    imagem={curso.fotos?.length ? curso.fotos[0] : null}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ======== BUTTON ======== */}
            <div className='flex w-full justify-center'>
                <Link to='/cursosInfantis'>
                    <Button
                        className='
                            bg-orange-base text-white hover:bg-orange-light px-6 py-2 
                            cursor-pointer transition
                        '
                    >
                        Ver todos
                    </Button>
                </Link>
            </div>

        </section>
    )
}