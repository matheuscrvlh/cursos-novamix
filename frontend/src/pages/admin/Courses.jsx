// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// DB
import {courses} from '../../../../backend/data/data'

export default function Courses() {
    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <SideBar />
            <Text as='main' className='flex-1 p-15 ml-[15%]'>
                <TopBar title={'Cursos'} />
                <Text as='article' className='flex gap-[6%] mb-15'>
                    <CardDash>
                        <Text as='p' className='font-bold'>CURSOS</Text>
                    </CardDash>
                    <CardDash>
                        <Text as='p' className='font-bold'>INCRIÇÕES TOTAIS</Text>
                    </CardDash>
                    <CardDash>
                        <Text as='p' className='font-bold'>SEILA</Text>
                    </CardDash>
                </Text>
                <Text as='article' className='flex flex-col gap-10'>
                    <CardDash className='bg-white h-[200px] w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold'>CADASTRE UM CURSO</Text>
                        <Input placeholder='Curso'/>
                        <Input type='date' className='w-[150px] p-2 bg-gray rounded-md'/>
                        <Input type='time' className='w-[150px] p-2 bg-gray rounded-md'/>
                        <Input placeholder='Loja'/>
                        <Input placeholder='Culinarista'/>
                        <Input type='text' inputmode='decimal' placeholder='Valor'/>
                    </CardDash>
                    <CardDash className='bg-white h-[200px] w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold'>CURSOS ATIVOS</Text>
                        {courses.map(curso => (
                            <Text as='ul'>
                                <Text as='li'>{`${curso.id} - ${curso.nome} - ${curso.data} - ${curso.hora} - ${curso.loja}`}</Text>
                            </Text>
                        ))}
                    </CardDash>
                </Text>
            </Text>
        </Text>
    )
}