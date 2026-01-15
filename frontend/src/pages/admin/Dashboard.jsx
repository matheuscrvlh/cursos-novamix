// Components
import Text from '../../components/Text'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

export default function Dashboard() {
    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <SideBar />
            <Text as='main' className='flex-1 p-15 ml-[15%]'>
                <TopBar title={'Dashboard'} />
                <Text as='article' className='flex gap-[6%] mb-15'>
                    
                </Text>
                <Text as='article' className='flex flex-col gap-10'>
                    
                </Text>
            </Text>
        </Text>
    )
}