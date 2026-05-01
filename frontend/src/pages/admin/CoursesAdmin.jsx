// react
import { useContext, useState } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit } from 'lucide-react';

// Components
import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function CoursesAdmin() {

    const { 
        cursos,
        loading, 
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
        ativo: 'true',
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
            if (key === 'imagem') return; // ignora o campo imagem no loop
            if (value) formData.append(key, value);
        });

        if (form.imagem) {
            formData.append('fotos', form.imagem); // só adiciona com o nome certo
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

        Object.entries(cursoEditar).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        if (cursoEditar.fotos) {
            formData.append('fotos', cursoEditar.fotos);
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

                    {/* FORM */}
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

                        {loading ? (
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

                    {/* MODAL */}
                    <Modal isOpen={step === 'edit'} onClose={closeModal}>
                        <h2 className='font-bold text-xl mb-4'>Editar Curso</h2>

                        {previewImagemCurso && (
                            <img src={previewImagemCurso} className='w-40 mb-4'/>
                        )}

                        <Input
                            value={cursoEditar.nomeCurso || ''}
                            onChange={e => setCursoEditar({
                                ...cursoEditar,
                                nomeCurso: e.target.value
                            })}
                        />

                        <Input
                            type='file'
                            onChange={e => {
                                const file = e.target.files[0];
                                if (!file) return;

                                setCursoEditar({ ...cursoEditar, fotos: file });
                                setPreviewImagemCurso(URL.createObjectURL(file));
                            }}
                        />

                        <Button onClick={editarCourse} className='mt-4 w-full bg-orange-base text-white'>
                            Salvar
                        </Button>
                    </Modal>

                </section>
            </main>
        </div>
    );
}