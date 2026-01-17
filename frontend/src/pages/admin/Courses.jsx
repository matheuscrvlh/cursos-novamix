// React
import { useContext, useState, useEffect } from 'react';
import React from 'react'

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
        nomeCurso: '',
        data: '',
        hora: '',
        loja: '',
        culinarista: '',
        valor: '',
        ativo: 'true'
    });

  function handleSubmit() {
    if (!form.nomeCurso || !form.hora || !form.data || !form.loja) {
        alert('Preencha todos os campos');
        return;
    }

    const formData = new FormData();

    formData.append('nomeCurso', form.nomeCurso);
    formData.append('data', form.data);
    formData.append('hora', form.hora);
    formData.append('loja', form.loja);
    formData.append('culinarista', form.culinarista);
    formData.append('valor', form.valor);
    formData.append('ativo', form.ativo);

    if (form.imagem) {
        formData.append('fotos', form.imagem); // mesmo nome do backend
    }

    addCourses(formData);

    setForm({
        nomeCurso: '',
        data: '',
        hora: '',
        loja: '',
        culinarista: '',
        valor: '',
        ativo: 'true',
        imagem: null,
    });
}


    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <SideBar />
            <Text as='main' className='flex-1 p-15 ml-[15%]'>
                <TopBar title={'Cursos'} />
                <Text as='article' className='flex gap-[6%] mb-15'>
                    <CardDash width='30%' height='150px'>
                        <Text as='p' className='font-bold text-gray-text'>CURSOS ATIVOS</Text>
                        <Text as='p' className='font-bold text-6xl text-gray-text text-center pt-1'>
                            {dados.length}
                        </Text>
                    </CardDash>
                    <CardDash width='30%'>
                        <Text as='p' className='font-bold'>INCRIÇÕES TOTAIS</Text>
                    </CardDash>
                    <CardDash width='30%'>
                        <Text as='p' className='font-bold'>SEILA</Text>
                    </CardDash>
                </Text>
                <Text as='article' className='flex flex-col gap-10'>
                    <CardDash className='bg-white h-[200px] w-full h-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-gray-text'>CADASTRE UM CURSO</Text>
                        <Text as='div' className='flex flex-wrap w-full gap-[20px] mt-[30px]'>
                            <Input 
                                type='text'
                                placeholder='Curso'
                                width='400px'
                                height='40px'
                                value={form.nomeCurso}
                                onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                            />
                            <Input 
                                type='date' 
                                width='170px'
                                height='40px'
                                value={form.data}
                                onChange={e => setForm({ ...form, data: e.target.value })}
                            />
                            <Input 
                                type='time' 
                                width='140px'
                                height='40px'
                                value={form.hora}
                                onChange={e => setForm({ ...form, hora: e.target.value })}
                            />
                            <Text 
                                as='select' 
                                value={form.loja}
                                onChange={e => setForm({ ...form, loja: e.target.value})}
                                className='w-[150px] h-[40px] border border-gray-base rounded-md'
                            >
                                <Text as='option' value=''>Selecione a loja</Text>
                                <Text as='option' value='Prado'>Prado</Text>
                                <Text as='option' value='Teresopolis'>Teresopolis</Text>
                            </Text>
                            <Input 
                                type='text'
                                width='400px'
                                height='40px'
                                placeholder='Culinarista'
                                value={form.culinarista}
                                onChange={e => setForm({ ...form, culinarista: e.target.value })}
                            />
                            <Input 
                                type='text' 
                                width='170px'
                                height='40px'
                                placeholder='Valor'
                                value={form.valor}
                                onChange={e => setForm({ ...form, valor: e.target.value})}
                            />
                            <Input 
                                type='file'
                                accept='image/png, image/jpeg'
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setForm((prev) => ({
                                        ...prev,
                                        imagem: file,
                                    }));
                                }}
                            >
                            </Input>
                            <Button 
                                width='100%'
                                className='bg-orange-base hover:bg-orange-light text-white'
                                onClick={handleSubmit}
                            >
                                Adicionar
                            </Button>
                        </Text>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-xl mb-3 text-gray-text'>CURSOS ATIVOS</Text>
                        <Text as='div' className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] font-bold text-gray-text'>
                            <Text as='p'>NOME</Text>
                            <Text as='p'>CULINARISTA</Text>
                            <Text as='p'>VALOR</Text>
                            <Text as='p'>DATA</Text>
                            <Text as='p'>HORARIO</Text>
                            <Text as='p'>LOJA</Text>
                            <Text as='p'>FUNÇÕES</Text>
                        </Text>
                        {loading ? (
                            <Text as='p'>Carregando cursos...</Text>
                        ) : (
                            dados.map(curso => (
                            <Text as='div' className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] text-gray-text mt-3' key={curso.id}>
                                <Text as='p'>{curso.nomeCurso}</Text>
                                <Text as='p'>{curso.culinarista}</Text>
                                <Text as='p'>{curso.valor}</Text>
                                <Text as='p'>{curso.data}</Text>
                                <Text as='p'>{curso.hora}</Text>
                                <Text as='p'>{curso.loja}</Text>
                                    
                                <Button 
                                    className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
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