// Components
import Text from '../../components/Text'

// HEAD
import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// HOOKS
import { useThemeColor } from '../../hooks/useThemeColor'

export default function Dashboard() {

    // FUNDO PAGINA
    useThemeColor('#F5F5F5');
    
    return (
        <Text as='div' className='flex w-full min-h-[100vdh] bg-gray overflow-x-hidden'>
            <Head title='Admin | Dashboard'/>
            <SideBar />
           <Text as='main' className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Dashboard'} />
                <Text as='div' className='h-full w-full flex flex-col font-semibold gap-3 text-center justify-center mt-50%'>
                    <Text as='p' className=''>Pagina ainda não desenvolvida.</Text>
                    <Text as='p'>Vá para a página de cursos.</Text>
                </Text>
            </Text>
        </Text>
    )
}