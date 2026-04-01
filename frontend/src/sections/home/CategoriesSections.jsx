// REACT
import { Link } from 'react-router-dom'

// COMPONENTS
import Text from "../../components/Text"

// IMAGES
import { cursos, culinaristas, cursosInfantis, industrias } from '../../assets/images/categorias';

export default function CategoriesSections() {
    return (
        <Text as='section' className='flex flex-col w-[80vw] mx-auto items-center mb-35 mt-35'>
            <Text 
                as='div' 
                className='grid grid-cols-4 w-[50vw] justify-center gap-10 text-center text-gray-dark'
            >   
                <Link to={'/cursos'}>
                    <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                        <div className='w-[180px] h-[180px] rounded-full bg-orange-base'>
                            <img src={cursos} alt="Cursos" className='rounded-full -translate-y-2 -translate-x-2'/>
                        </div>
                        <p className='font-bold mr-2'>Cursos</p>
                    </div>
                </Link>
                <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                    <div className='w-[180px] h-[180px] rounded-full bg-orange-base'>
                        <img src={cursosInfantis} alt="Cursos Infantis" className='rounded-full -translate-y-2 -translate-x-2'/>
                    </div>
                    <p className='font-bold mr-2'>Cursos Infantis</p>
                </div>
                <Link to={'/culinaristas'}>
                    <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                        <div className='w-[180px] h-[180px] rounded-full bg-orange-base'>
                            <img src={culinaristas} alt="Culinaristas" className='rounded-full -translate-y-2 -translate-x-2'/>
                        </div>
                        <p className='font-bold mr-2'>Culinaristas</p>
                    </div>
                </Link>
                <div as='div' className='flex flex-col gap-4 cursor-pointer items-center'>
                    <div className='w-[180px] h-[180px] rounded-full bg-orange-base'>
                        <img src={industrias} alt="Industrias" className='rounded-full -translate-y-2 -translate-x-2'/>
                    </div>
                    <p className='font-bold mr-2'>Industrias Parceiras</p>
                </div>
            </Text>
        </Text>
    )
}