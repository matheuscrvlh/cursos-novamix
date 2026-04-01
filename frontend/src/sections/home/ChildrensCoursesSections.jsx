// REACT
import { Link } from 'react-router-dom'

// COMPONENTS
import Text from "../../components/Text"
import Button from "../../components/Button";
import CourseCard from "../../components/public/CourseCard";

// ICONS
import { Menu } from "lucide-react";

export default function ChildrensCoursesSections({
    cursosFiltrados,
    vagasPorCurso,
    openForm,
    showModalFilters,
    setShowModalFilters
}) {

    // layout data
    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <Text as='section' className='w-[80vw] mx-auto'>
        
            {/* ======== FILTERS ======== */}
            <Text
                as='div'
                className='
                            flex justify-between items-baseline-last pb-5 w-[80%] mx-auto
                            md:w-[80vw]
                        '
            >
                <Text as='div'>
                    <Text as='p' className='
                                text-lg font-bold text-gray-dark
                                md:text-3xl
                            '>
                        CURSOS INFANTIS
                    </Text>
                </Text>
                <Text
                    as='div'
                    onClick={() => setShowModalFilters(!showModalFilters)}
                    className='
                                flex gap-2 items-center text-white bg-orange-base px-3 py-2 rounded-xl cursor-pointer font-bold
                                hover:bg-orange-light transition
                                md:px-7 md:py-2
                            '
                >
                    <Text as='p'>Filtros</Text>
                    <Menu
                        className='
                                w-6 h-6 
                        '
                    />
                </Text>
            </Text>

            {/* ======== CURSOS ======== */}
            <Text as='div' className='
                bg-gray flex justify-center w-full pb-10
            '>
                {cursosFiltrados.length === 0
                    ? (<Text as='div' className='flex flex-col items-center justify-center w-full text-center mt-20'>
                        <Text as='p' className='text-xl font-semibold'>Nenhum curso encontrado.</Text>
                        <Text as='p'>Favor tente com outros filtros.</Text>
                    </Text>
                    ) : (
                        <Text
                            as='div'
                            className='
                                bg-gray grid grid-cols-1 gap-10 justify-items-center
                                sm:grid-cols-2
                                lg:grid-cols-3
                                xl:grid-cols-4
                        '
                        >
                            {cursosFiltrados.slice(0, 4).map(curso => {
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
                                        className='
                                                w-full max-w-[380px]
                                        '
                                        imagem={curso.fotos?.length ? curso.fotos[0] : null}
                                    />
                                );
                            })}
                        </Text>
                    )}
            </Text>

            {/* ======== BUTTON ======== */}
            <Text as='div' className='
                flex w-full justify-center
            '>  
                <Link to={'/cursos'}>
                    <Button className='
                        bg-orange-base text-white hover:bg-orange-light px-6 py-2 
                        cursor-pointer transition
                    '>
                        Ver todos
                    </Button>
                </Link>
            </Text>
            
        </Text>
    )
}