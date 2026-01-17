// React
import { useEffect } from "react"

// Components
import Text from "../Text"

export default function Modal({
    as = 'div',
    width,
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
        <Text as='div' className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70'>
            <Text 
                as={as}
                style={{ width, height }}
                className={`bg-white shadow-md rounded-md p-4 ${className}`}
                {...props}
            >
                <Text 
                    as='button'
                    className='cursor-pointer'
                    onClick={onClose}
                >
                    X
                </Text>
                {children}
            </Text>
        </Text>
    )
}