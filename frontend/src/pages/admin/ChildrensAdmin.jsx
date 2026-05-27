// react
import { useContext, useState } from 'react';

// HEAD
import { Head } from '../../components/Head'

// ICONS
import { Trash, Edit } from 'lucide-react';

// Components
import Input from '../../components/Input'
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
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Cursos Infantis'/>
            <SideBar />

            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Cursos Infantis'} />

                <section className='flex flex-col gap-10 mt-10 w-[92dvw] lg:w-[78vw]'>

                    {/* FORM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text mb-6'>CADASTRE UM CURSO INFANTIL</p>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>

                            <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Curso</label>
                                <Input placeholder='Nome do curso'
                                    value={form.nomeCurso}
                                    onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data</label>
                                <Input type='date'
                                    value={form.data}
                                    onChange={e => setForm({ ...form, data: e.target.value })}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário</label>
                                <Input type='time'
                                    value={form.hora}
                                    onChange={e => setForm({ ...form, hora: e.target.value })}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja</label>
                                <select value={form.loja}
                                    onChange={e => setForm({ ...form, loja: e.target.value })}
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                >
                                    <option value=''>Selecione a loja</option>
                                    <option value='Prado'>Prado</option>
                                    <option value='Teresopolis'>Teresopolis</option>
                                </select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                                <select value={form.culinarista}
                                    onChange={e => setForm({ ...form, culinarista: e.target.value })}
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                >
                                    <option value=''>Selecione a culinarista</option>
                                    {culinaristas?.map(c => (
                                        <option key={c.id} value={c.nomeCulinarista}>
                                            {c.nomeCulinarista}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor</label>
                                <Input placeholder='Valor'
                                    value={form.valor}
                                    onChange={e => setForm({ ...form, valor: e.target.value })}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração</label>
                                <Input placeholder='Duração'
                                    value={form.duracao}
                                    onChange={e => setForm({ ...form, duracao: e.target.value })}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria</label>
                                <Input placeholder='Categoria'
                                    value={form.categoria}
                                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Imagem</label>
                                <Input
                                    type='file'
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setForm(prev => ({ ...prev, fotos: file }));
                                    }}
                                />
                            </div>

                            <div className='md:col-span-2 lg:col-span-3 mt-2'>
                                <Button
                                    onClick={handleSubmit}
                                    className='bg-orange-base text-white w-full hover:bg-orange-light'
                                >
                                    Adicionar Curso Infantil
                                </Button>
                            </div>

                        </div>
                    </CardDash>

                    {/* LISTAGEM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text mb-4'>CURSOS INFANTIS</p>

                        <div className='max-h-100 overflow-y-auto'>

                            {/* HEADER DESKTOP */}
                            <div className='hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.6fr_0.7fr_auto] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>Descrição</p>
                                <p>Culinarista</p>
                                <p>Data</p>
                                <p>Horário</p>
                                <p>Loja</p>
                                <p>Ações</p>
                            </div>

                            {cursosInfantis.length === 0 ? (
                                <p className='text-gray-text text-center py-8'>Nenhum curso infantil cadastrado</p>
                            ) : (
                                cursosInfantis.map((c, i) => (
                                    <div key={i}>
                                        {/* MOBILE */}
                                        <div className='md:hidden p-3 text-gray-text'>
                                            <p className='font-semibold'>{c.nomeCurso}</p>
                                            <p className='text-sm text-gray-text/70'>{c.culinarista} · {formatarData(c.data)} · {c.hora}</p>
                                            {c.loja === 'Prado'
                                                ? <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-base/10 text-orange-base'>{c.loja}</span>
                                                : <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-base/20 text-blue-base'>{c.loja}</span>
                                            }
                                            <div className='flex gap-2 mt-2'>
                                                <Button
                                                    className='bg-red-base p-2 hover:bg-red-light text-white'
                                                    onClick={() => removeCursoInfantil(c.id)}
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                                <Button
                                                    className='bg-orange-base p-2 hover:bg-orange-light text-white'
                                                    onClick={() => handleEdit(c.id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* DESKTOP */}
                                        <div className='hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.6fr_0.7fr_auto] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <p className='font-medium truncate pr-2'>{c.nomeCurso}</p>
                                            <p className='truncate'>{c.culinarista}</p>
                                            <p>{formatarData(c.data)}</p>
                                            <p>{c.hora}</p>
                                            {c.loja === 'Prado'
                                                ? <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-orange-base/10 text-orange-base'>{c.loja}</span>
                                                : <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-blue-base/20 text-blue-base'>{c.loja}</span>
                                            }
                                            <div className='flex gap-2'>
                                                <Button
                                                    className='bg-red-base p-2 hover:bg-red-light text-white'
                                                    onClick={() => removeCursoInfantil(c.id)}
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                                <Button
                                                    className='bg-orange-base p-2 hover:bg-orange-light text-white'
                                                    onClick={() => handleEdit(c.id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <hr className='border-gray-base/20'/>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardDash>

                    {/* MODAL */}
                    <Modal
                        isOpen={step === 'edit'}
                        onClose={closeModal}
                        width='90%'
                        maxWidth='700px'
                    >
                        {/* HEADER */}
                        <div className='mb-6'>
                            <h2 className='text-xl font-bold text-gray-text'>Editar Curso Infantil</h2>
                            <hr className='border-gray-base/30 w-full mt-3'/>
                        </div>

                        {/* FOTO */}
                        <div className='flex items-start gap-5 mb-6 p-4 bg-gray rounded-lg'>
                            {previewImagem
                                ? <img src={previewImagem} className='w-28 h-28 shrink-0 object-cover rounded-lg'/>
                                : <div className='w-28 h-28 shrink-0 rounded-lg bg-gray-base/20 flex items-center justify-center text-gray-text text-xs text-center'>
                                    Sem foto
                                  </div>
                            }
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Alterar Foto</label>
                                <Input
                                    type='file'
                                    accept='image/*'
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setCursoEditar(prev => ({ ...prev, fotos: file }));
                                        setPreviewImagem(URL.createObjectURL(file));
                                    }}
                                />
                            </div>
                        </div>

                        {/* CAMPOS */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                            <div className='flex flex-col gap-1.5 md:col-span-2'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Nome do Curso</label>
                                <Input
                                    value={cursoEditar.nomeCurso || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data</label>
                                <Input
                                    type='date'
                                    value={cursoEditar.data || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário</label>
                                <Input
                                    type='time'
                                    value={cursoEditar.hora || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja</label>
                                <select
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                    value={cursoEditar.loja || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, loja: e.target.value })}
                                >
                                    <option value=''>Selecione a loja</option>
                                    <option value='Prado'>Prado</option>
                                    <option value='Teresopolis'>Teresopolis</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                                <select
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                    value={cursoEditar.culinarista || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, culinarista: e.target.value })}
                                >
                                    <option value=''>Selecione a culinarista</option>
                                    {culinaristas?.map(c => (
                                        <option key={c.id} value={c.nomeCulinarista}>{c.nomeCulinarista}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor</label>
                                <Input
                                    value={cursoEditar.valor || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, valor: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração</label>
                                <Input
                                    value={cursoEditar.duracao || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, duracao: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria</label>
                                <Input
                                    value={cursoEditar.categoria || ''}
                                    onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={salvarEdicao}
                            className='bg-orange-base text-white w-full hover:bg-orange-light'
                        >
                            Salvar Edições
                        </Button>
                    </Modal>

                </section>
            </main>
        </div>
    );
}