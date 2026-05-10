// react
import { useContext, useState } from 'react';

// HEAD
import { Head } from '../../components/Head'

// ICONS
import { Trash, Edit } from 'lucide-react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// Context
import { DadosContext } from '../../contexts/DadosContext';

export default function ChildrensAdmin() {

    const { 
        cursosInfantis = [],
        addCursoInfantil,
        removeCursoInfantil,
        editCursoInfantil,
        culinaristas
    } = useContext(DadosContext);

    // ================= STATES =================
    const [form, setForm] = useState({
        nomeCurso: '',
        data: '',
        hora: '',
        loja: '',
        culinarista: '',
        valor: '',
        duracao: '',
        categoria: '',
        fotos: null
    });

    const [cursoEditar, setCursoEditar] = useState({});
    const [step, setStep] = useState('close');
    const [previewImagem, setPreviewImagem] = useState(null);

    // ================= CREATE =================
    function handleSubmit() {
        if (!form.nomeCurso || !form.data || !form.hora || !form.loja) {
            alert('Preencha os campos obrigatórios');
            return;
        }

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (!value) return;

            if (key === 'fotos') {
                formData.append('fotos', value);
            } else {
                formData.append(key, value);
            }
        });

        addCursoInfantil(formData);

        setForm({
            nomeCurso: '',
            data: '',
            hora: '',
            loja: '',
            culinarista: '',
            valor: '',
            duracao: '',
            categoria: '',
            fotos: null
        });
    }

    // ================= EDIT =================
    function handleEdit(id) {
        const curso = cursosInfantis.find(c => c.id === id);
        if (!curso) return;

        setCursoEditar(curso);
        setStep('edit');

        if (curso.fotos?.[0]) {
            setPreviewImagem(curso.fotos[0]);
        }
    }

    function salvarEdicao() {
        const formData = new FormData();

        formData.append('id', cursoEditar.id);

        Object.entries(cursoEditar).forEach(([key, value]) => {
            if (!value) return;

            if (key === 'fotos') {
                if (value instanceof File) {
                    formData.append('fotos', value);
                }
            } else {
                formData.append(key, value);
            }
        });

        editCursoInfantil(formData);
        setStep('close');
    }

    function closeModal() {
        setCursoEditar({});
        setPreviewImagem(null);
        setStep('close');
    }

    function formatarData(data) {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Cursos Infantis'/>
            <SideBar />

            <Text as='main' className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Cursos Infantis'} />

                <Text as='section' className='flex flex-col gap-10 mt-10 w-[92dvw] lg:w-[78vw]'>

                    {/* FORM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <Text className='font-bold text-gray-text mb-4'>
                            CADASTRE UM CURSO INFANTIL
                        </Text>

                        <Text className='flex flex-wrap gap-3 text-gray-dark'>

                            <Input placeholder='Curso'
                                value={form.nomeCurso}
                                onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                            />

                            <Input type='date'
                                value={form.data}
                                onChange={e => setForm({ ...form, data: e.target.value })}
                            />

                            <Input type='time'
                                value={form.hora}
                                onChange={e => setForm({ ...form, hora: e.target.value })}
                            />

                            {/* LOJA */}
                            <Text as='select'
                                value={form.loja}
                                onChange={e => setForm({ ...form, loja: e.target.value })}
                                className='w-[150px] h-[40px] border border-gray-base rounded-md'
                            >
                                <Text as='option' value=''>Selecione a loja</Text>
                                <Text as='option' value='Prado'>Prado</Text>
                                <Text as='option' value='Teresopolis'>Teresopolis</Text>
                            </Text>

                            {/* CULINARISTA */}
                            <Text as='select'
                                value={form.culinarista}
                                onChange={e => setForm({ ...form, culinarista: e.target.value })}
                                className='w-[200px] h-[40px] border border-gray-base rounded-md'
                            >
                                <Text as='option' value=''>Selecione a culinarista</Text>

                                {culinaristas?.map(c => (
                                    <Text key={c.id} as='option' value={c.nomeCulinarista}>
                                        {c.nomeCulinarista}
                                    </Text>
                                ))}
                            </Text>

                            <Input placeholder='Valor'
                                value={form.valor}
                                onChange={e => setForm({ ...form, valor: e.target.value })}
                            />

                            <Input placeholder='Duração'
                                value={form.duracao}
                                onChange={e => setForm({ ...form, duracao: e.target.value })}
                            />

                            <Input placeholder='Categoria'
                                value={form.categoria}
                                onChange={e => setForm({ ...form, categoria: e.target.value })}
                            />

                            <Input
                                type='file'
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setForm(prev => ({
                                        ...prev,
                                        fotos: file
                                    }));
                                }}
                            />

                            <Button
                                onClick={handleSubmit}
                                className='bg-orange-base text-white w-full hover:bg-orange-light'
                            >
                                Adicionar
                            </Button>

                        </Text>
                    </CardDash>

                    {/* LISTAGEM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <Text className='font-bold text-gray-text'>CURSOS INFANTIS</Text>

                        <Text className='mt-4 max-h-[400px] overflow-y-auto'>
                            {cursosInfantis.map((c, i) => (
                                <Text key={i}
                                    className='flex justify-between items-center p-2 border-b text-gray-text'
                                >
                                    <Text>
                                        {c.nomeCurso} - {formatarData(c.data)}
                                    </Text>

                                    <Text className='flex gap-2'>
                                        <Button
                                            className='bg-red-base text-white p-2'
                                            onClick={() => removeCursoInfantil(c.id)}
                                        >
                                            <Trash />
                                        </Button>

                                        <Button
                                            className='bg-orange-base text-white p-2'
                                            onClick={() => handleEdit(c.id)}
                                        >
                                            <Edit />
                                        </Button>
                                    </Text>
                                </Text>
                            ))}
                        </Text>
                    </CardDash>

                    {/* MODAL */}
                    <Modal
                        isOpen={step === 'edit'}
                        onClose={closeModal}
                        width='90%'
                        maxWidth='600px'
                    >
                        <Text className='font-bold text-xl mb-5 text-gray-text'>
                            Editar Curso Infantil
                        </Text>

                        {previewImagem && (
                            <img src={previewImagem} className='w-[200px] mb-4' />
                        )}

                        <Text className='flex flex-col gap-3'>

                            <Input
                                value={cursoEditar.nomeCurso || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                            />

                            <Input
                                type='date'
                                value={cursoEditar.data || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                            />

                            <Text
                                as='select'
                                className='w-full h-[40px] border border-gray-base rounded-md'
                                value={cursoEditar.loja || ''}
                                onChange={e => setCursoEditar({
                                    ...cursoEditar,
                                    loja: e.target.value
                                })}
                            >
                                <Text as='option' value=''>Selecione a loja</Text>
                                <Text as='option' value='Prado'>Prado</Text>
                                <Text as='option' value='Teresopolis'>Teresopolis</Text>
                            </Text>

                            <Text
                                as='select'
                                className='w-full h-[40px] border border-gray-base rounded-md'
                                value={cursoEditar.culinarista || ''}
                                onChange={e => setCursoEditar({
                                    ...cursoEditar,
                                    culinarista: e.target.value
                                })}
                            >
                                <Text as='option' value=''>Selecione a culinarista</Text>

                                {culinaristas?.map(c => (
                                    <Text
                                        key={c.id}
                                        as='option'
                                        value={c.nomeCulinarista}
                                    >
                                        {c.nomeCulinarista}
                                    </Text>
                                ))}
                            </Text>

                              <Input
                                value={cursoEditar.valor || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, valor: e.target.value })}
                            />

                              <Input
                                value={cursoEditar.duracao || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, duracao: e.target.value })}
                            />

                              <Input
                                value={cursoEditar.categoria || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                            />

                              <Input
                                type='time'
                                value={cursoEditar.hora || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                            />

                            <Button
                                onClick={salvarEdicao}
                                className='bg-orange-base text-white w-full mt-4'
                            >
                                Salvar
                            </Button>

                        </Text>
                    </Modal>

                </Text>
            </Text>
        </Text>
    );
}