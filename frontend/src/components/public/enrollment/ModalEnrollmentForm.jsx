import { useEffect } from "react"
import Input from "../../Input"
import Button from "../../Button"

export default function ModalEnrollmentForm({
    isOpen,
    onClick,
    onClose,
    enrollment,
    setEnrollment,
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

    useEffect(() => {
        console.log(enrollment)
    }, [enrollment])

    if (!isOpen) return null

    const isDisabled =
        !enrollment.nome ||
        !enrollment.cpf ||
        !enrollment.celular ||
        !enrollment.formaPagamento

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-md rounded-md p-4 md:p-6 w-[90%] max-w-[500px] h-auto max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <button
                    className='cursor-pointer text-xl md:text-2xl font-bold text-gray-dark hover:text-orange-base float-right mb-2'
                    onClick={onClose}
                    aria-label="Fechar modal"
                >
                    ✕
                </button>

                <div className="clear-both" />

                <div className='flex flex-col gap-3 h-full'>
                    <p className='font-semibold mb-3 text-center text-lg md:text-xl mt-auto'>
                        Digite suas informações para cadastrarmos você!
                    </p>

                    <Input
                        type='text'
                        width='100%'
                        height='40px'
                        placeholder='Nome completo'
                        value={enrollment.nome}
                        onChange={e => setEnrollment({ ...enrollment, nome: e.target.value })}
                    />

                    <Input
                        type='text'
                        width='100%'
                        height='40px'
                        placeholder='CPF'
                        value={enrollment.cpf}
                        onChange={e => setEnrollment({ ...enrollment, cpf: e.target.value })}
                    />

                    <Input
                        type='text'
                        width='100%'
                        height='40px'
                        placeholder='Celular'
                        value={enrollment.celular}
                        onChange={e => setEnrollment({ ...enrollment, celular: e.target.value })}
                    />

                    <select
                        className='w-full h-[40px] p-2 border border-gray-base rounded-md'
                        value={enrollment.formaPagamento}
                        onChange={e => setEnrollment({ ...enrollment, formaPagamento: e.target.value })}
                    >
                        <option value=''>Forma de Pagamento</option>
                        <option value='link'>Link de Pagamento</option>
                    </select>

                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                        onClick={onClick}
                        disabled={isDisabled}
                    >
                        Enviar
                    </Button>
                </div>
            </div>
        </div>
    )
}