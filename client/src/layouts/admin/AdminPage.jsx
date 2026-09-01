import { Head } from '../../components/Head'
import SideBar from './SideBar'
import TopBar from './TopBar'

export default function AdminPage({ title, children }) {
    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title={`Admin - ${title}`} />
            <SideBar />
            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={title} />
                <section className='flex flex-col gap-10 mt-10 w-[92dvw] md:gap-20 lg:w-[78vw]'>
                    {children}
                </section>
            </main>
        </div>
    )
}
