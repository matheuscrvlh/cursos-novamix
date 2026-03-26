// React
import { useEffect } from "react"

// Components
import Text from "../../Text"
import Input from "../../Input"
import Button from "../../Button"

export default function ModalEnrollmentForm({
    isOpen,
    onClick,
    onClose,
    form,
    setForm,
    ...props
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <Text
            as='div'
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <Text
                as='div'
                className='bg-white shadow-md rounded-md p-4 md:p-6 w-[90%] max-w-[500px] h-auto max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <Text
                    as='button'
                    className='cursor-pointer text-xl md:text-2xl font-bold text-gray-dark hover:text-orange-base float-right mb-2'
                    onClick={onClose}
                >
                    ✕
                </Text>
                <div className="clear-both" />
                <Text as='div' className='flex flex-col gap-3 h-full'>
                    <Text as='p' className='font-semibold mb-3 text-center text-lg md:text-xl mt-auto'>
                        Digite suas informações para cadastramos você!
                    </Text>
                    <Input
                        type='text'
                        width='100%'
                        height='40px'
                        placeholder='Nome completo'
                        value={form.nome}
                        onChange={e => setForm({ ...form, nome: e.target.value })}
                    />
                    <Input
                        type='text'
                        width='100%'
                        height='40px'
                        placeholder='CPF'
                        value={form.cpf}
                        onChange={e => setForm({ ...form, cpf: e.target.value })}
                    />
                    <Input
                        type='text'
                        width='100%'
                        height='40px'
                        placeholder='Telefone'
                        value={form.celular}
                        onChange={e => setForm({ ...form, celular: e.target.value })}
                    />
                    <Text
                        as='select'
                        className='w-full h-[40px] p-2 border border-gray-base rounded-md'
                        value={form.formaPagamento}
                        onChange={e => setForm({ ...form, formaPagamento: e.target.value })}
                    >
                        <Text as='option' value=''>Forma de Pagamento</Text>
                        <Text as='option' value='link'>Link de Pagamento</Text>
                    </Text>
                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                        onClick={onClick}
                    >
                        Enviar
                    </Button>
                </Text>
            </Text>
        </Text>
    )
}