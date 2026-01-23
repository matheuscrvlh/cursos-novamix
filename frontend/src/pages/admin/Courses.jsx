// React
import { useContext, useState, useEffect } from 'react';

// HEAD
import { Head } from '../../components/Head'

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import CoursesDashboard from '../../components/admin/CoursesDashboard';
import CoursesRegister from '../../components/admin/CoursesRegister';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function Courses() {
    // ======= STATE COMPONENTS
    const [ view, setView ] = useState('dashboard')
    
    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Cursos'/>
            <SideBar />
             <Text as='main' className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Cursos'} />
                <Text as='div'>
                    <Button 
                        onClick={() => setView('dashboard')}
                        className={`text-white shadow-sm 
                            ${view === 'dashboard' 
                                ? 'bg-orange-base'
                                : 'bg-orange-light'
                            }
                        `}
                    >
                        Dashboard
                    </Button>
                    <Button
                        onClick={() => setView('cadastro')}
                        className={`text-white shadow-sm 
                            ${view === 'cadastro'
                                ? 'bg-orange-base'
                                : 'bg-orange-light'
                            }
                        `}
                    >
                        Cadastro
                    </Button>
                    {view === 'dashboard'
                        ? <CoursesDashboard/>
                        : <CoursesRegister/>
                    }
                </Text>
            </Text>
        </Text>
    )
}