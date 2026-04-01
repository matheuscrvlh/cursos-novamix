// REACT
import { useState } from 'react'

// COMPONENTS
import Text from "../../components/Text"
import Button from '../../components/Button'

export default function LocationSections() {

    // ========= STATE
    const [ location, setLocation ] = useState({
        iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.8119903550783!2d-42.52638522395205!3d-22.24721111463339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97f53afe6cd153%3A0x1a71499c558657e1!2sNovaMix%20Food%20Service!5e0!3m2!1spt-BR!2sbr!4v1775067360332!5m2!1spt-BR!2sbr',
        adress: 'Av. Gov. Roberto Silveira, 1700 - Duas Pedras, Nova Friburgo - RJ, 28635-000',
        time: 'De Seg a Sab, das 8:30 às 19h '
    }) 

    return (
        <Text as='section' className='w-[80vw] mx-auto mt-30'>
            <Text as='div' className='flex justify-end gap-5'>
                <Button 
                    className={`text-white ${location.adress.includes('Duas Pedras') ? 'bg-gray-base' : 'bg-orange-base'}`}
                    onClick={() => setLocation(prev => ({
                        ...prev,
                        iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.8119903550783!2d-42.52638522395205!3d-22.24721111463339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97f53afe6cd153%3A0x1a71499c558657e1!2sNovaMix%20Food%20Service!5e0!3m2!1spt-BR!2sbr!4v1775067360332!5m2!1spt-BR!2sbr',
                        adress: 'Av. Gov. Roberto Silveira, 1700 - Duas Pedras, Nova Friburgo - RJ, 28635-000',
                    }))}
                >
                    Friburgo
                </Button>
                <Button
                    className={`text-white ${location.adress.includes('Teresópolis') ? 'bg-gray-base' : 'bg-orange-base'}`}
                    onClick={() => setLocation(prev => ({
                        ...prev,
                        iframe:'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3688.439377782724!2d-42.97246841431132!3d-22.412482567792775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x984dd8feadadd3%3A0x999ed84beae4d97b!2sNovamix%20Food%20Service!5e0!3m2!1spt-BR!2sbr!4v1775069806369!5m2!1spt-BR!2sbr',
                        adress: 'R. Duque de Caxias, 170 - Várzea, Teresópolis - RJ, 25953-390'
                    }))}
                >
                    Teresópolis
                </Button>
            </Text>
            <Text as='div' className='flex justify-between mt-5'>
                <Text as='div'>
                    <Text as='div' className='text-7xl text-gray-dark'>
                        <Text as='p'>CONFIRA</Text>
                        <Text as='p' className='text-orange-base font-bold'>NOSSA</Text>
                        <Text as='p'>LOCALIZAÇÃO</Text>
                    </Text>
                    <Text as='div' className='flex flex-col gap-5 text-gray-dark mt-10'>
                        <Text as='div'>
                            <Text as='p' className='text-xl font-bold'>Endereço</Text>
                            <Text as='p'>{location.adress}</Text>
                        </Text>
                        <Text as='div'>
                            <Text as='p' className='text-xl font-bold'>Horário de Atendimento</Text>
                            <Text as='p'>{location.time}</Text>
                        </Text>
                    </Text>
                </Text>
                <Text
                    as='iframe' 
                    src={location.iframe}
                    className='w-[60%] h-100'
                />
            </Text>
        </Text>
    )
}