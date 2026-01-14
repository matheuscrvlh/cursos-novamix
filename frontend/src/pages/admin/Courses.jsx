// React
import { useContext, useState } from 'react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function Courses() {
    const { 
            dados,
            loading, 
            addCourses, 
            removeCourse 
        } = useContext(DadosContext);

    const [form, setForm] = useState({
        nome: '',
        data: '',
        hora: '',
        loja: '',
        culinarista: '',
        valor: '',
        ativo: 'true'
    });

    function handleSubmit() {
        if(!form.nome || !form.hora || !form.data || !form.loja) {
            alert('Preencha todos os campos')
            return;
        }

        addCourses(form);

        setForm({
            nome: '',
            data: '',
            hora: '',
            loja: '',
            culinarista: '',
            valor: '',
            ativo: 'true'
        });
    }

    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <SideBar />
            <Text as='main' className='flex-1 p-15 ml-[15%]'>
                <TopBar title={'Cursos'} />
                <Text as='article' className='flex gap-[6%] mb-15'>
                    <CardDash>
                        <Text as='p' className='font-bold'>CURSOS ATIVOS</Text>
                        <Text as='p' className='font-bold text-6xl text-center pt-4'>
                            {dados.length}
                        </Text>
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
                        <Input 
                            placeholder='Curso'
                            value={form.nome}
                            onChange={e => setForm({ ...form, nome: e.target.value })}
                        />
                        <Input 
                            type='date' 
                            className='w-[150px] p-2 bg-gray rounded-md'
                            value={form.data}
                            onChange={e => setForm({ ...form, data: e.target.value })}
                        />
                        <Input 
                            type='time' 
                            className='w-[150px] p-2 bg-gray rounded-md'
                            value={form.hora}
                            onChange={e => setForm({ ...form, hora: e.target.value })}
                        />
                        <Input 
                            placeholder='Loja'
                            value={form.loja}
                            onChange={e => setForm({ ...form, loja: e.target.value})}
                        />
                        <Input 
                            placeholder='Culinarista'
                            value={form.culinarista}
                            onChange={e => setForm({ ...form, culinarista: e.target.value })}
                        />
                        <Input 
                            type='text' 
                            placeholder='Valor'
                            value={form.valor}
                            onChange={e => setForm({ ...form, valor: e.target.value})}
                        />
                        <Button 
                            className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md'
                            onClick={handleSubmit}
                        >
                            Adicionar
                        </Button>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-xl mb-3 text-gray-dark'>CURSOS ATIVOS</Text>
                        <Text as='div' className='flex gap-[20%] font-bold'>
                            <Text as='p'>NOME</Text>
                            <Text as='p'>LOJA</Text>
                            <Text as='p'>DATA</Text>
                            <Text as='p'>HORARIO</Text>
                        </Text>
                        {loading ? (
                            <Text as='p'>Carregando cursos...</Text>
                        ) : (
                            dados.map(curso => (
                            <Text as='div' className='flex ml-[5%]' key={curso.id}>
                                <Text as='p' className='w-100 bg-orange-base'>{curso.nome}</Text>
                                <Text as='p'>{curso.loja}</Text>
                                <Text as='p'>{curso.data}</Text>
                                <Text as='p'>{curso.hora}</Text>
                                    
                                <Button 
                                    className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md'
                                    onClick={() => removeCourse(curso.id)}
                                >
                                    Excluir
                                </Button>
                            </Text>
                        )))}
                    </CardDash>
                </Text>
            </Text>
        </Text>
    )
}