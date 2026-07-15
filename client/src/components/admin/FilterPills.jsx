export default function FilterPills({ value, onChange, options, activeClass = 'bg-orange-base text-white' }) {
    return (
        <div className='flex flex-wrap gap-1.5'>
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        value === opt.value ? (opt.activeClass || activeClass) : 'bg-gray text-gray-text hover:bg-gray-base/20'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}
