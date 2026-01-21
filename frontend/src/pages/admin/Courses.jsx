// React
import { useContext, useState, useEffect } from 'react';

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
            cursos,
            loading, 
            addCourses, 
            removeCourse,
            addCulinarian,
            culinaristas
        } = useContext(DadosContext);
    
    // ======= STATE CURSOS
    const [form, setForm] = useState({
        nomeCurso: '',
        data: '',
        hora: '',
        loja: '',
        culinarista: '',
        valor: '',
        duracao: '',
        categoria: '',
        ativo: 'true'
    });

    // ======= STATE CULINARISTAS
    const [formCulinarian, setFormCulinarian] = useState({
        nomeCulinarista: '',
        cpf: '',
        instagram: '',
        industria: '',
        telefone: '',
        cursoAtual: '',
        lojas: [],
        cursos: [],
        foto: null
    });

    useEffect(() => {
        console.log(formCulinarian)
    }, [formCulinarian])

    // ======= CADASTRO CULINARISTA
    function handleSubmitCulinarian() {
        if(
            !formCulinarian.nomeCulinarista 
            || !formCulinarian.cpf 
            ) 
        {
            alert('Preencha os campos.');
            return
        }

        const formData = new FormData();

        formData.append('nomeCulinarista', formCulinarian.nomeCulinarista);
        formData.append('cpf', formCulinarian.cpf);
        formData.append('instagram', formCulinarian.instagram);
        formData.append('industria', formCulinarian.industria);
        formData.append('telefone', formCulinarian.telefone);
        formData.append('lojas', JSON.stringify(formCulinarian.lojas));
        formData.append('cursos', JSON.stringify(formCulinarian.cursos));

        if(formCulinarian.foto) {
            formData.append('foto', formCulinarian.foto);
        }

        addCulinarian(formData);

        setFormCulinarian({
            nomeCulinarista: '',
            cpf: '',
            instagram: '',
            industria: '',
            telefone: '',
            cursoAtual: '',
            lojas: [],
            cursos: [],
            foto: null
        });
    }

    // ======= CADASTRO CURSOS
    function handleSubmit() {
    if (!form.nomeCurso || !form.hora || !form.data || !form.loja || !form.categoria || !form.duracao) {
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
        formData.append('duracao', form.duracao);
        formData.append('categoria', form.categoria);
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
            duracao: '',
            categoria: '',
            ativo: 'true',
            imagem: null,
        })
    }

    // ======== Toggle loja Culinarista
    function handleToggleLoja(loja) {
        setFormCulinarian(prev => {
            const existe = prev.lojas.includes(loja)

            return {
                ...prev,
                lojas:  existe
                ? prev.lojas.filter(l => l !== loja)
                : [...prev.lojas, loja]
            }
        })
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
                        {cursos.length}
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
                                type='text'
                                width='140px'
                                height='40px'
                                placeholder='Duração'
                                value={form.duracao}
                                onChange={e => setForm({ ...form, duracao: e.target.value })}
                            />
                            <Input 
                                type='text'
                                width='150px'
                                height='40px'
                                placeholder='Categoria'
                                value={form.categoria}
                                onChange={e => setForm({ ...form, categoria: e.target.value })}
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
                        <Text as='div' className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] font-bold text-gray-text'>
                            <Text as='p'>DESCRIÇÃO</Text>
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
                            cursos.map(curso => (
                            <Text as='div' className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] text-gray-text mt-3' key={curso.id}>
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
                    <CardDash as='div' className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-gray-text mb-4'>CADASTRE UMA CULINARISTA</Text>
                        <Text as='div' className='flex flex-wrap gap-3'>
                            <Input
                                width='250px'
                                height='40px'
                                placeholder='Nome'
                                value={formCulinarian.nomeCulinarista}
                                onChange={e => setFormCulinarian({ ...formCulinarian, nomeCulinarista: e.target.value})}
                            />
                            <Input
                                width='170px'
                                height='40px'   
                                placeholder='Cpf'
                                value={formCulinarian.cpf}
                                onChange={e => setFormCulinarian({ ...formCulinarian, cpf: e.target.value})}
                            />
                            <Input
                                width='170px'
                                height='40px'   
                                placeholder='Insdustria'
                                value={formCulinarian.industria}
                                onChange={e => setFormCulinarian({ ...formCulinarian, industria: e.target.value})}
                            />
                            <Input
                                width='170px'
                                height='40px'   
                                placeholder='Telefone'
                                value={formCulinarian.telefone}
                                onChange={e => setFormCulinarian({ ...formCulinarian, telefone: e.target.value})}
                            />
                            <Input
                                width='170px'
                                height='40px'   
                                placeholder='Instagram'
                                value={formCulinarian.instagram}
                                onChange={e => setFormCulinarian({ ...formCulinarian, instagram: e.target.value})}
                            />
                            <Input
                                width='170px'
                                height='40px' 
                                className='mr-7'
                                type='file'
                                accept='image/png, image/jpeg'
                                onChange={(e) => {
                                    const file = e.target.files[0]
                                    if(!file) return

                                    setFormCulinarian((prev) => ({
                                        ...prev,
                                        foto: file,
                                    }))
                                }}
                            />
                            <Text as='div' className='flex gap-3'>
                                <Input 
                                    type='checkbox'
                                    className='w-6 cursor-pointer'
                                    id='prado'
                                    name='Prado'
                                    value='Prado'
                                    onChange={() => handleToggleLoja('Prado')}
                                />
                                <Text as='label' className='mt-2 mr-9'>Prado</Text>
                                <Input 
                                    type='checkbox'
                                    className='w-6 cursor-pointer'
                                    id='teresopolis'
                                    name='teresopolis'
                                    value='Teresopolis'
                                    onChange={() => handleToggleLoja('Teresopolis')}
                                />
                                <Text as='label' className='mt-2'>Teresopolis</Text>
                            </Text>

                            <Text as='div' className='flex gap-3'>
                                <Input
                                    width='250px'
                                    height='40px'
                                    placeholder='Curso'
                                    value={formCulinarian.cursoAtual}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, cursoAtual: e.target.value })}
                                />
                                <Button
                                    width='180px'
                                    className='bg-orange-base text-white'
                                    onClick={() => {
                                        if(!formCulinarian.cursoAtual) {
                                            alert('Preencha o campo.')
                                        }
                                        setFormCulinarian({ 
                                            ...formCulinarian,
                                            cursos: [
                                                ...formCulinarian.cursos,
                                                formCulinarian.cursoAtual
                                            ],
                                            cursoAtual: ''
                                        })}
                                    }
                                >
                                    Adicionar Curso
                                </Button>
                            </Text>
                            <Text as='div' className='flex flex-wrap gap-3 w-full'>
                                {formCulinarian.cursos.map((curso, index) => (
                                    <Text 
                                        as='div'
                                        key={index}
                                        className="relative flex items-center"
                                    >
                                        <Text 
                                            as='p' 
                                            className="bg-orange-base px-4 py-2 text-white rounded-md"
                                        >
                                            {curso}
                                        </Text>
                                        <Text 
                                            className="
                                                absolute -top-2 -right-2
                                                flex items-center justify-center
                                                w-5 h-5 text-xs
                                                bg-black text-white
                                                rounded-full cursor-pointer font-bold
                                                "
                                            onClick={() => {
                                                setFormCulinarian({
                                                    ...formCulinarian,
                                                    cursos: formCulinarian.cursos.filter(
                                                        (_, i) => i !== index
                                                    )
                                                    
                                                })
                                            }}
                                        >
                                            X
                                        </Text>
                                    </Text>
                                ))}
                            </Text>
                            <Button 
                                onClick={handleSubmitCulinarian}
                                className='bg-orange-base text-white w-full'
                            >
                                Adicionar Culinarista
                            </Button>
                        </Text>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-gray-text'>
                            CULINARISTAS ATIVAS
                            <Text>
                                {culinaristas.map(c => (
                                    <Text as='div' className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] text-gray-text mt-3' key={c.id}>
                                        <Text as='p'>{c.nomeCulinarista}</Text>
                                        <Text as='p'>{c.industria}</Text>
                                        <Text as='p'>{c.telefone}</Text>
                                        <Text as='p'>{c.instagram}</Text>
                                        <Text as='p'>{c.lojas}</Text>
                                        <Text as='p'>{c.dataCadastro}</Text>
                                    </Text>
                                ))}
                            </Text>
                        </Text>
                    </CardDash>
                </Text>
            </Text>
        </Text>
    )
}