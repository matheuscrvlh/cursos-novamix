// Head
import { Head } from '../../components/Head'

// Components
import Text from '../../components/Text'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

export default function Culinarian() {
    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Culinaristas'/>
            <SideBar />
            <Text as='main' className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Culinaristas'} />
            </Text>
        </Text>
    )
}