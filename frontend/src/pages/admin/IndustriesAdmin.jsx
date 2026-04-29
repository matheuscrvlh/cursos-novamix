import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// React
import { useContext, useState } from 'react';

// Icons
import { Trash, Edit } from 'lucide-react';

// Components
import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// Context
import { DadosContext } from '../../contexts/DadosContext';

export default function IndustriesAdmin() {
    const { 
        industrias,
        addIndustry,
        removeIndustry,
        editIndustry
    } = useContext(DadosContext);

    const [formIndustria, setFormIndustria] = useState({
        razaoSocial: '',
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
        instagram: '',
        site: '',
        foto: null
    });

    const [industriaEditar, setIndustriaEditar] = useState({});
    const [step, setStep] = useState('close');

    function handleSubmitIndustria() {
        if (!formIndustria.nome || !formIndustria.razaoSocial) {
            alert('Nome e Razão Social são obrigatórios');
            return;
        }

        const formData = new FormData();

        Object.entries(formIndustria).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        addIndustry(formData);

        setFormIndustria({
            razaoSocial: '',
            nome: '',
            cnpj: '',
            telefone: '',
            email: '',
            endereco: '',
            instagram: '',
            site: '',
            foto: null
        });
    }

    function handleEditIndustria(id) {
        const industria = industrias.find(i => i.id === id);
        setIndustriaEditar(industria);
        setStep('edit');
    }

    async function salvarEdicao() {
        const formData = new FormData();

        formData.append('id', industriaEditar.id);

        Object.entries(industriaEditar).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (key === 'foto') {
                if (value instanceof File) {
                    formData.append('foto', value);
                }
            } else {
                formData.append(key, value);
            }
        });

        await editIndustry(formData);
        setStep('close');
    }

    function closeModal() {
        setIndustriaEditar({});
        setStep('close');
    }

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Industrias'/>
            <SideBar />

            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Indústrias'} />

                <section className='flex flex-col gap-10 mt-10 w-[92dvw] lg:w-[78vw]'>

                    {/* FORM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text mb-4'>
                            CADASTRE UMA INDÚSTRIA
                        </p>

                        <div className='flex flex-wrap gap-3 text-gray-dark'>

                            <Input placeholder='Razão Social'
                                value={formIndustria.razaoSocial}
                                onChange={e => setFormIndustria({ ...formIndustria, razaoSocial: e.target.value })}
                            />

                            <Input placeholder='Nome Fantasia'
                                value={formIndustria.nome}
                                onChange={e => setFormIndustria({ ...formIndustria, nome: e.target.value })}
                            />

                            <Input placeholder='CNPJ'
                                value={formIndustria.cnpj}
                                onChange={e => setFormIndustria({ ...formIndustria, cnpj: e.target.value })}
                            />

                            <Input placeholder='Telefone'
                                value={formIndustria.telefone}
                                onChange={e => setFormIndustria({ ...formIndustria, telefone: e.target.value })}
                            />

                            <Input placeholder='Email'
                                value={formIndustria.email}
                                onChange={e => setFormIndustria({ ...formIndustria, email: e.target.value })}
                            />

                            <Input placeholder='Endereço'
                                value={formIndustria.endereco}
                                onChange={e => setFormIndustria({ ...formIndustria, endereco: e.target.value })}
                            />

                            <Input placeholder='Instagram'
                                value={formIndustria.instagram}
                                onChange={e => setFormIndustria({ ...formIndustria, instagram: e.target.value })}
                            />

                            <Input placeholder='Site'
                                value={formIndustria.site}
                                onChange={e => setFormIndustria({ ...formIndustria, site: e.target.value })}
                            />

                            <Input
                                type='file'
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setFormIndustria(prev => ({
                                        ...prev,
                                        foto: file
                                    }));
                                }}
                            />

                            <Button
                                onClick={handleSubmitIndustria}
                                className='bg-orange-base text-white w-full hover:bg-orange-light'
                            >
                                Adicionar Indústria
                            </Button>

                        </div>
                    </CardDash>

                    {/* LISTAGEM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text'>INDÚSTRIAS</p>

                        <div className='mt-4 max-h-[400px] overflow-y-auto'>
                            {industrias.map(i => (
                                <div 
                                    key={i.id} 
                                    className='flex justify-between items-center p-2 border-b text-gray-text'
                                >
                                    <p>
                                        {i.nome} - {i.razaoSocial}
                                    </p>

                                    <div className='flex gap-2'>
                                        <Button
                                            className='bg-red-base text-white p-2 hover:bg-red-light'
                                            onClick={() => removeIndustry(i.id)}
                                        >
                                            <Trash />
                                        </Button>

                                        <Button
                                            className='bg-orange-base text-white p-2 hover:bg-orange-light'
                                            onClick={() => handleEditIndustria(i.id)}
                                        >
                                            <Edit />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardDash>

                    {/* MODAL EDIT */}
                    <Modal
                        isOpen={step === 'edit'}
                        onClose={closeModal}
                        width='90%'
                        maxWidth='600px'
                    >
                        <p className='font-bold text-xl mb-5 text-gray-text'>
                            Editar Indústria
                        </p>

                        <div className='flex flex-col gap-3 text-gray-dark'>

                            <Input
                                placeholder='Nome'
                                value={industriaEditar.nome || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, nome: e.target.value })}
                            />

                            <Input
                                placeholder='Razão Social'
                                value={industriaEditar.razaoSocial || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, razaoSocial: e.target.value })}
                            />

                            <Input
                                placeholder='CNPJ'
                                value={industriaEditar.cnpj || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, cnpj: e.target.value })}
                            />

                            <Input
                                placeholder='Telefone'
                                value={industriaEditar.telefone || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, telefone: e.target.value })}
                            />

                            <Input
                                placeholder='Email'
                                value={industriaEditar.email || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, email: e.target.value })}
                            />

                            <Input
                                placeholder='Endereço'
                                value={industriaEditar.endereco || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, endereco: e.target.value })}
                            />

                            <Input
                                placeholder='Instagram'
                                value={industriaEditar.instagram || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, instagram: e.target.value })}
                            />

                            <Input
                                placeholder='Site'
                                value={industriaEditar.site || ''}
                                onChange={e => setIndustriaEditar({ ...industriaEditar, site: e.target.value })}
                            />

                            <Input
                                type='file'
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setIndustriaEditar(prev => ({
                                        ...prev,
                                        foto: file
                                    }));
                                }}
                            />

                            <Button
                                onClick={salvarEdicao}
                                className='bg-orange-base text-white w-full mt-4 hover:bg-orange-light'
                            >
                                Salvar
                            </Button>

                        </div>
                    </Modal>

                </section>
            </main>
        </div>
    );
}