// REACT
import { useState } from 'react'

// COMPONENTS
import Button from '../../components/Button'

export default function LocationSections() {

    const [location, setLocation] = useState({
        iframe: 'https://www.google.com/maps/embed?pb=!1m18!...',
        adress: 'Av. Gov. Roberto Silveira, 1700 - Duas Pedras, Nova Friburgo - RJ, 28635-000',
        time: 'De Seg a Sab, das 8:30 às 19h '
    })

    return (
        <section className='w-[80vw] mx-auto mt-20 md:mt-30'>

            <div className='flex justify-end gap-5'>
                <Button
                    className={`text-white ${location.adress.includes('Duas Pedras') ? 'bg-gray-base' : 'bg-orange-base'}`}
                    onClick={() => setLocation(prev => ({
                        ...prev,
                        iframe: 'https://www.google.com/maps/embed?pb=!1m18!...',
                        adress: 'Av. Gov. Roberto Silveira, 1700 - Duas Pedras, Nova Friburgo - RJ, 28635-000',
                    }))}
                >
                    Friburgo
                </Button>

                <Button
                    className={`text-white ${location.adress.includes('Teresópolis') ? 'bg-gray-base' : 'bg-orange-base'}`}
                    onClick={() => setLocation(prev => ({
                        ...prev,
                        iframe: 'https://www.google.com/maps/embed?pb=!1m18!...',
                        adress: 'R. Duque de Caxias, 170 - Várzea, Teresópolis - RJ, 25953-390'
                    }))}
                >
                    Teresópolis
                </Button>
            </div>

            <div className='flex flex-col justify-between items-center mt-5 md:flex-row md:mt-0'>

                <div>
                    <div className='text-4xl text-gray-dark md:text-7xl'>
                        <p>CONFIRA</p>
                        <p className='text-orange-base font-bold'>NOSSA</p>
                        <p>LOCALIZAÇÃO</p>
                    </div>

                    <div className='flex flex-col gap-5 mt-5 text-gray-dark md:mt-10'>
                        <div>
                            <p className='text-md font-bold md:text-xl'>Endereço</p>
                            <p className='text-sm md:text-base'>
                                {location.adress}
                            </p>
                        </div>

                        <div>
                            <p className='text-md font-bold md:text-xl'>Horário de Atendimento</p>
                            <p className='text-sm md:text-base'>
                                {location.time}
                            </p>
                        </div>
                    </div>
                </div>

                <iframe
                    src={location.iframe}
                    className='w-full mt-10 h-80 md:h-100 md:w-[60%]'
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        </section>
    )
}