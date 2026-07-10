export default function Tooltip({ label, children }) {
    return (
        <div className='relative group/tip'>
            {children}
            <span className='
                absolute -top-8 left-1/2 -translate-x-1/2
                bg-gray-text text-white text-xs px-2 py-1 rounded-md
                opacity-0 group-hover/tip:opacity-100
                transition-opacity duration-150
                whitespace-nowrap pointer-events-none z-50
            '>
                {label}
                <span className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-text'/>
            </span>
        </div>
    )
}
