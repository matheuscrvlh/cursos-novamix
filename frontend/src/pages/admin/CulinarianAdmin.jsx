// Head
import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// React
import { useContext, useState } from 'react';

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X } from 'lucide-react';

// Components
import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function CulinarianAdmin() {
    const { 
        culinaristas,
        addCulinarian,
        removeCulinarian,
        editCulinarian,
        industrias
    } = useContext(DadosContext);
    
    const [cursoAtual, setCursoAtual] = useState('');

    const [formCulinarian, setFormCulinarian] = useState({
        nomeCulinarista: '',
        cpf: '',
        instagram: '',
        industria: '',
        telefone: '',
        lojas: [],
        cursos: [],
        foto: null
    });

    const [culinarianEditar, setCulinarianEditar] = useState({});
    const [step, setStep] = useState('close');
    const [previewImagemCulinarista, setPreviewImagemCulinarista] = useState();

    function handleSubmitCulinarian() {
        if(!formCulinarian.nomeCulinarista || !formCulinarian.cpf) {
            alert('Preencha os campos.');
            return
        }

        const formData = new FormData();

        Object.entries(formCulinarian).forEach(([key, value]) => {
            if (key === 'lojas' || key === 'cursos') {
                formData.append(key, JSON.stringify(value));
            } else if (value) {
                formData.append(key, value);
            }
        });

        addCulinarian(formData);

        setFormCulinarian({
            nomeCulinarista: '',
            cpf: '',
            instagram: '',
            industria: '',
            telefone: '',
            lojas: [],
            cursos: [],
            foto: null
        });
    }

    function handleEditCulinarian(id) {
        const c = culinaristas.find(c => c.id === id);
        setCulinarianEditar(c);
        setStep('edit');
    }

    function closeModal() {
        setCulinarianEditar({});
        setPreviewImagemCulinarista(null);
        setStep('close');
    }

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Culinaristas'/>
            <SideBar />

            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title='Culinaristas' />

                <section className='flex flex-col gap-10 mt-10 w-[92dvw] lg:w-[78vw]'>

                    {/* FORM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text mb-4'>
                            CADASTRE UMA CULINARISTA
                        </p>

                        <div className='flex flex-wrap gap-3'>

                            <Input
                                placeholder='Nome'
                                value={formCulinarian.nomeCulinarista}
                                onChange={e => setFormCulinarian({ ...formCulinarian, nomeCulinarista: e.target.value })}
                            />

                            <Input
                                placeholder='CPF'
                                value={formCulinarian.cpf}
                                onChange={e => setFormCulinarian({ ...formCulinarian, cpf: e.target.value })}
                            />

                            <select
                                className='w-full min-w-40 h-[40px] border rounded-md'
                                value={formCulinarian.industria}
                                onChange={e => setFormCulinarian({ ...formCulinarian, industria: e.target.value })}
                            >
                                <option value=''>Selecione a indústria</option>
                                {industrias.map(i => (
                                    <option key={i.id} value={i.nome}>
                                        {i.nome}
                                    </option>
                                ))}
                            </select>

                            <Input
                                placeholder='Telefone'
                                value={formCulinarian.telefone}
                                onChange={e => setFormCulinarian({ ...formCulinarian, telefone: e.target.value })}
                            />

                            <Input
                                placeholder='Instagram'
                                value={formCulinarian.instagram}
                                onChange={e => setFormCulinarian({ ...formCulinarian, instagram: e.target.value })}
                            />

                            <Input
                                type='file'
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setFormCulinarian(prev => ({
                                        ...prev,
                                        foto: file
                                    }));
                                }}
                            />

                            <Button
                                onClick={handleSubmitCulinarian}
                                className='bg-orange-base text-white w-full'
                            >
                                Adicionar
                            </Button>

                        </div>
                    </CardDash>

                    {/* LISTAGEM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text'>CULINARISTAS</p>

                        <div className='mt-4'>
                            {culinaristas.map(c => (
                                <div key={c.id} className='flex justify-between border-b p-2'>
                                    <span>{c.nomeCulinarista}</span>

                                    <div className='flex gap-2'>
                                        <Button onClick={() => removeCulinarian(c.id)}>
                                            <Trash />
                                        </Button>

                                        <Button onClick={() => handleEditCulinarian(c.id)}>
                                            <Edit />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardDash>

                    {/* MODAL */}
                    <Modal
                        isOpen={step === 'edit'}
                        onClose={closeModal}
                    >
                        <h2 className='font-bold text-xl mb-4'>
                            Editar Culinarista
                        </h2>

                        <Input
                            value={culinarianEditar.nomeCulinarista || ''}
                            onChange={e => setCulinarianEditar({
                                ...culinarianEditar,
                                nomeCulinarista: e.target.value
                            })}
                        />

                        <Button className='mt-4'>
                            Salvar
                        </Button>
                    </Modal>

                </section>
            </main>
        </div>
    );
}