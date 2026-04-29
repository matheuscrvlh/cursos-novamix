export default function TopBar({title}) {
    return (
        <header className='bg-gray w-full'>
            <h1 className='text-orange-base font-bold text-3xl md:mt-15'>{title}</h1>
        </header>
    )
}