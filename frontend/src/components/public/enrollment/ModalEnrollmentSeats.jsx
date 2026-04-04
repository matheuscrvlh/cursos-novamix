// React
import { useEffect } from "react"

// Components
import Text from "../../Text"
import Button from "../../Button"

export default function ModalEnrollmentSeats({
    isOpen,
    onClick,
    onClose,
    enrollment,
    setEnrollment,
    assentos,
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
                    <Text as='p' className='font-semibold text-center text-lg md:text-xl mt-auto'>
                        Escolha seu assento para assistir ao curso
                    </Text>
                    <Text
                        as='div'
                        className='bg-gray-base rounded-sm p-4 md:p-6 text-center text-white font-semibold mb-6 md:mb-10'
                    >
                        Balcão
                    </Text>

                    {/* Grid de assentos responsivo */}
                    <Text as='div' className='grid grid-cols-6 gap-2'>
                        {assentos.map(assento => {
                            const isReservado = assento.status === 'reservado';
                            const isSelecionado = enrollment.assento === assento.id;

                            return (
                                <Text
                                    as='p'
                                    key={assento.id}
                                    className={`p-2 rounded-full text-center font-semibold text-white text-sm ${isReservado
                                        ? 'bg-gray-base cursor-not-allowed'
                                        : isSelecionado
                                            ? 'bg-gray-dark cursor-pointer'
                                            : 'bg-orange-base cursor-pointer'
                                        }`}
                                    onClick={() => {
                                        if (isReservado) return;

                                        setEnrollment(prev => ({
                                            ...prev,
                                            assento: assento.id
                                        }));
                                    }}
                                >
                                    {assento.id}
                                </Text>
                            )
                        })}
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