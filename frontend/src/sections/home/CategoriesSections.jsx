// REACT
import { Link } from 'react-router-dom'

// COMPONENTS
import Text from "../../components/Text"

// IMAGES
import { cursos, culinaristas, cursosInfantis, industrias } from '../../assets/images/categorias';

export default function CategoriesSections() {
    return (
        <Text as='section' className='
            flex flex-col w-screen items-center mb-25 mt-25
            md:w-[80vw] md:mx-auto md:mb-35 md:mt-35
        '>
            <Text 
                as='div' 
                className='
                    grid grid-cols-2 w-[70vw] justify-center gap-10 text-center text-gray-dark
                    md:grid-cols-4 md:w-[50vw] md:gap-10
                '
            >   
                <Link to={'/cursos'}>
                    <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                        <div className='w-25 h-25 rounded-full bg-orange-base md:w-[180px] md:h-[180px]'>
                            <img src={cursos} alt="Cursos" className='rounded-full -translate-y-2 -translate-x-2'/>
                        </div>
                        <p className='font-bold mr-2 text-sm md:text-base'>Cursos</p>
                    </div>
                </Link>
                <Link to={'/cursosInfantis'}>
                    <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                        <div className='w-25 h-25 rounded-full bg-orange-base md:w-[180px] md:h-[180px]'>
                            <img src={cursosInfantis} alt="Cursos Infantis" className='rounded-full -translate-y-2 -translate-x-2'/>
                        </div>
                        <p className='font-bold mr-2 text-sm md:text-base'>Cursos Infantis</p>
                    </div>
                </Link>
                <Link to={'/culinaristas'}>
                    <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                        <div className='w-25 h-25 rounded-full bg-orange-base md:w-[180px] md:h-[180px]'>
                            <img src={culinaristas} alt="Culinaristas" className='rounded-full -translate-y-2 -translate-x-2'/>
                        </div>
                        <p className='font-bold mr-2 text-sm md:text-base'>Culinaristas</p>
                    </div>
                </Link>
                <Link to={'/industrias'}>
                    <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                        <div className='w-25 h-25 rounded-full bg-orange-base md:w-[180px] md:h-[180px]'>
                            <img src={industrias} alt="Industrias" className='rounded-full -translate-y-2 -translate-x-2'/>
                        </div>
                        <p className='font-bold mr-2 text-sm md:text-base'>Industrias Parceiras</p>
                    </div>
                </Link>
            </Text>
        </Text>
    )
}