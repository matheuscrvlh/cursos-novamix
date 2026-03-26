// React
import { useEffect } from "react"

// Components
import Text from "../../Text"
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
                <Text
                    as='div'
                    className='flex flex-col w-full h-full font-semibold p-2 gap-3 text-center'
                >
                    <Text as='p' className='text-lg md:text-xl'>Você foi cadastrado(a)!</Text>
                    <Text as='p' className='text-lg md:text-xl'>Entraremos em contato para finalizar seu pagamento.</Text>
                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                        onClick={onClick}
                    >
                        Sair
                    </Button>
                </Text>
            </Text>
        </Text>
    )
}