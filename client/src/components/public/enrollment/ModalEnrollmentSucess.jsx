import { CheckCircle2, PartyPopper } from "lucide-react"

import Button from "../../Button"
import useBodyScrollLock from "../../../hooks/useBodyScrollLock"

export default function ModalEnrollmentSucess({
    isOpen,
    onClick,
    onClose,
    pago = true,
    ...props
}) {
    useBodyScrollLock(isOpen)

    if (!isOpen) return null

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-chocolate/55 backdrop-blur-sm z-50 p-4 animate-pagina'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-2xl rounded-2xl animate-surgir w-[90%] max-w-96 overflow-hidden'
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <div className='bg-green-base/10 flex flex-col items-center justify-center py-10 px-6'>
                    <div className='w-20 h-20 rounded-full bg-green-base/15 flex items-center justify-center mb-4'>
                        <CheckCircle2 size='2.625rem' className='text-green-base' />
                    </div>
                    <h2 className='font-serif text-[2rem] font-semibold leading-none text-chocolate text-center'>Inscrição confirmada!</h2>
                    <p className='text-sm text-gray-text/60 text-center mt-1'>Você está na lista do curso 🎉</p>
                </div>

                <div className='p-6 flex flex-col gap-4'>
                    <p className='text-sm text-gray-text/70 text-center leading-relaxed'>
                        {pago
                            ? 'Pagamento confirmado! Você está na lista do curso.'
                            : 'Recebemos sua inscrição. Seu pagamento está em análise e você será avisado assim que for confirmado.'}
                    </p>
                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white font-semibold'
                        onClick={onClick}
                    >
                        Fechar
                    </Button>
                </div>

            </div>
        </div>
    )
}
