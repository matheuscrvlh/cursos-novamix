
export default function TopBar({ title }) {

    const hoje = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

    const dataFormatada = hoje.charAt(0).toUpperCase() + hoje.slice(1)

    return (
        <header className='w-full bg-gray pt-10 pb-5'>
            <div className='flex flex-col gap-1 md:flex-row md:items-end md:justify-between'>
                <h1 className='text-orange-base font-bold text-2xl md:text-3xl leading-tight'>
                    {title}
                </h1>
                <p className='text-gray-text/50 text-xs md:text-sm capitalize'>
                    {dataFormatada}
                </p>
            </div>
            <div className='mt-4 h-px bg-linear-to-r from-orange-base/40 via-orange-base/10 to-transparent' />
        </header>
    )
}
