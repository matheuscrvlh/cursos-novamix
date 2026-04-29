import { useEffect } from "react"
import Button from "../../Button"

export default function ModalEnrollmentSucess({
    isOpen,
    onClick,
    onClose,
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
                >
                    ✕
                </button>

                <div className="clear-both" />

                <div className='flex flex-col w-full h-full font-semibold p-2 gap-3 text-center'>
                    <p className='text-lg md:text-xl'>
                        Você foi cadastrado(a)!
                    </p>

                    <p className='text-lg md:text-xl'>
                        Entraremos em contato para finalizar seu pagamento.
                    </p>

                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                        onClick={onClick}
                    >
                        Sair
                    </Button>
                </div>
            </div>
        </div>
    )
}