import { useContext, useState } from 'react';

import { Head } from '../../components/Head'
import { Trash, Edit } from 'lucide-react';

import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

import { DadosContext } from '../../contexts/DadosContext';

export default function CoursesAdmin() {

    const { 
        cursos,
        loadingCourses, 
        addCourses, 
        removeCourse,
        editCourse,
        culinaristas
    } = useContext(DadosContext);

    const [form, setForm] = useState({
        nomeCurso: '',
        data: '',
        hora: '',
        loja: '',
        culinarista: '',
        valor: '',
        duracao: '',
        categoria: '',
        imagem: null
    });

    const [cursoEditar, setCursoEditar] = useState({});
    const [step, setStep] = useState('close');
    const [previewImagemCurso, setPreviewImagemCurso] = useState(null);

    function handleSubmit() {
        if (!form.nomeCurso || !form.hora || !form.data) {
            alert('Preencha os campos');
            return;
        }

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (key === 'imagem') return;
            if (value) formData.append(key, value);
        });

        if (form.imagem) {
            formData.append('fotos', form.imagem);
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
            imagem: null
        });
    }

    function handleEditCourse(id) {
        const curso = cursos.find(c => c.id === id);
        if (!curso) return;

        setCursoEditar(curso);
        setPreviewImagemCurso(curso.fotos?.[0] || null);
        setStep('edit');
    }

    function editarCourse() {
        const formData = new FormData();

        formData.append('id',          cursoEditar.id);
        formData.append('nomeCurso',   cursoEditar.nomeCurso   || '');
        formData.append('data',        cursoEditar.data        || '');
        formData.append('hora',        cursoEditar.hora        || '');
        formData.append('loja',        cursoEditar.loja        || '');
        formData.append('culinarista', cursoEditar.culinarista || '');
        formData.append('valor',       cursoEditar.valor       || '');
        formData.append('duracao',     cursoEditar.duracao     || '');
        formData.append('categoria',   cursoEditar.categoria   || '');

        if (cursoEditar._novaFoto) {
            formData.append('fotos', cursoEditar._novaFoto);
        }

        editCourse(formData);
        setStep('close');
    }

    function closeModal() {
        setCursoEditar({});
        setPreviewImagemCurso(null);
        setStep('close');
    }

    function formatDate(data) {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Cursos'/>
            <SideBar />

            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title='Cursos' />

                <section className='flex flex-col gap-10 mt-10 w-[92dvw] lg:w-[78vw]'>

                    {/* FORM CADASTRO */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold mb-4'>CADASTRE UM CURSO</p>

                        <div className='flex flex-wrap gap-4'>
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
                            <select
                                value={form.loja}
                                onChange={e => setForm({ ...form, loja: e.target.value })}
                                className='h-[40px] border rounded-md'
                            >
                                <option value=''>Loja</option>
                                <option value='Prado'>Prado</option>
                                <option value='Teresopolis'>Teresopolis</option>
                            </select>
                            <select
                                value={form.culinarista}
                                onChange={e => setForm({ ...form, culinarista: e.target.value })}
                                className='h-[40px] border rounded-md'
                            >
                                <option value=''>Culinarista</option>
                                {culinaristas.map(c => (
                                    <option key={c.id} value={c.nomeCulinarista}>
                                        {c.nomeCulinarista}
                                    </option>
                                ))}
                            </select>
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
                            <Input type='file'
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setForm({ ...form, imagem: file });
                                }}
                            />
                            <Button onClick={handleSubmit} className='w-full bg-orange-base text-white'>
                                Adicionar
                            </Button>
                        </div>
                    </CardDash>

                    {/* LISTA */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold mb-4'>CURSOS</p>

                        {loadingCourses ? (
                            <p>Carregando...</p>
                        ) : (
                            cursos.map(curso => (
                                <div key={curso.id} className='flex justify-between border-b p-2'>
                                    <div>
                                        <p>{curso.nomeCurso}</p>
                                        <small>{formatDate(curso.data)} - {curso.hora}</small>
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button onClick={() => removeCourse(curso.id)}>
                                            <Trash />
                                        </Button>
                                        <Button onClick={() => handleEditCourse(curso.id)}>
                                            <Edit />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardDash>

                    {/* MODAL EDITAR */}
                    <Modal isOpen={step === 'edit'} onClose={closeModal}>
                        <h2 className='font-bold text-xl mb-4'>Editar Curso</h2>

                        {previewImagemCurso && (
                            <img src={`http://localhost:3001${previewImagemCurso}`} className='w-40 mb-4 rounded'/>
                        )}

                        <div className='flex flex-col gap-3'>
                            <Input
                                placeholder='Nome do curso'
                                value={cursoEditar.nomeCurso || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                            />
                            <Input
                                type='date'
                                value={cursoEditar.data || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                            />
                            <Input
                                type='time'
                                value={cursoEditar.hora || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                            />
                            <select
                                value={cursoEditar.loja || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, loja: e.target.value })}
                                className='h-[40px] border rounded-md px-2'
                            >
                                <option value=''>Loja</option>
                                <option value='Prado'>Prado</option>
                                <option value='Teresopolis'>Teresopolis</option>
                            </select>
                            <select
                                value={cursoEditar.culinarista || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, culinarista: e.target.value })}
                                className='h-[40px] border rounded-md px-2'
                            >
                                <option value=''>Culinarista</option>
                                {culinaristas.map(c => (
                                    <option key={c.id} value={c.nomeCulinarista}>
                                        {c.nomeCulinarista}
                                    </option>
                                ))}
                            </select>
                            <Input
                                placeholder='Valor'
                                value={cursoEditar.valor || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, valor: e.target.value })}
                            />
                            <Input
                                placeholder='Duração'
                                value={cursoEditar.duracao || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, duracao: e.target.value })}
                            />
                            <Input
                                placeholder='Categoria'
                                value={cursoEditar.categoria || ''}
                                onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                            />
                            <Input
                                type='file'
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setCursoEditar({ ...cursoEditar, _novaFoto: file });
                                    setPreviewImagemCurso(URL.createObjectURL(file));
                                }}
                            />
                            <Button onClick={editarCourse} className='mt-2 w-full bg-orange-base text-white'>
                                Salvar
                            </Button>
                        </div>
                    </Modal>

                </section>
            </main>
        </div>
    );
}