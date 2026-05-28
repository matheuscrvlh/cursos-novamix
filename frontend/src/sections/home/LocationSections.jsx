// REACT
import { useState } from 'react'

// ICONS
import { MapPin, Clock } from 'lucide-react'

export default function LocationSections() {

    const LOCATIONS = {
        friburgo: {
            iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.8119903550783!2d-42.52638522395205!3d-22.24721111463339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97f53afe6cd153%3A0x1a71499c558657e1!2sNovaMix%20Food%20Service!5e0!3m2!1spt-BR!2sbr!4v1775067360332!5m2!1spt-BR!2sbr',
            adress: 'Av. Gov. Roberto Silveira, 1700 - Duas Pedras, Nova Friburgo - RJ',
            time: 'De Seg a Sab, das 8:30 às 19h',
        },
        teresopolis: {
            iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3688.439377782724!2d-42.97246841431132!3d-22.412482567792775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x984dd8feadadd3%3A0x999ed84beae4d97b!2sNovamix%20Food%20Service!5e0!3m2!1spt-BR!2sbr!4v1775069806369!5m2!1spt-BR!2sbr',
            adress: 'R. Duque de Caxias, 170 - Várzea, Teresópolis - RJ',
            time: 'De Seg a Sab, das 8:30 às 19h',
        },
    }

    const [active, setActive] = useState('friburgo')
    const location = LOCATIONS[active]

    return (
        <section className='w-[90vw] mx-auto mt-16 pb-12 md:mt-30'>
            <div className='flex flex-col md:flex-row md:items-start md:gap-10'>

                {/* ===== LEFT: heading + tabs + info ===== */}
                <div className='flex flex-col gap-5 md:w-[38%]'>

                    {/* HEADING */}
                    <h2 className='text-3xl sm:text-4xl md:text-6xl font-bold text-gray-dark leading-tight'>
                        CONFIRA<br />
                        <span className='text-orange-base'>NOSSA</span><br />
                        LOCALIZAÇÃO
                    </h2>

                    {/* TOGGLE TABS */}
                    <div className='flex gap-2 bg-gray rounded-xl p-1'>
                        {[
                            { key: 'friburgo',    label: 'Friburgo' },
                            { key: 'teresopolis', label: 'Teresópolis' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActive(tab.key)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                    active === tab.key
                                        ? 'bg-orange-base text-white shadow-sm'
                                        : 'text-gray-text/60 hover:text-gray-text'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* INFO */}
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-start gap-2.5'>
                            <MapPin size={16} className='text-orange-base shrink-0 mt-0.5' />
                            <div>
                                <p className='text-xs font-semibold text-gray-text/50 uppercase tracking-wider mb-0.5'>Endereço</p>
                                <p className='text-sm text-gray-dark'>{location.adress}</p>
                            </div>
                        </div>
                        <div className='flex items-start gap-2.5'>
                            <Clock size={16} className='text-orange-base shrink-0 mt-0.5' />
                            <div>
                                <p className='text-xs font-semibold text-gray-text/50 uppercase tracking-wider mb-0.5'>Horário</p>
                                <p className='text-sm text-gray-dark'>{location.time}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT: mapa ===== */}
                <iframe
                    key={active}
                    src={location.iframe}
                    className='w-full h-60 sm:h-80 mt-6 rounded-xl md:flex-1 md:h-96 md:mt-0'
                    allowFullScreen
                    loading='lazy'
                />

            </div>
        </section>
    )
}
