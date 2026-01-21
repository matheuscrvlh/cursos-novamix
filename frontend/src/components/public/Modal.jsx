// React
import { useEffect } from "react"

// Components
import Text from "../Text"

export default function Modal({
    as = 'div',
    width,
    maxWidth,
    height,
    className,
    children,
    isOpen,
    onClose,
    ...props
}) {
    useEffect(() => {
        if(isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if(!isOpen) return null

    return (
        <Text 
            as='div' 
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <Text 
                as={as}
                style={{ 
                    width, 
                    height,
                    maxWidth: maxWidth || width
                }}
                className={`bg-white shadow-md rounded-md p-4 md:p-6 max-h-[90vh] overflow-y-auto ${className}`}
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
                {children}
            </Text>
        </Text>
    )
}