// REACT
import { useEffect, useState } from "react"

// COMPONENTS
import Text from "../../components/Text"

export default function AllCulinariansSections({ culinaristas }) {

    return (
        <Text as='section' className='w-[80vw] mx-auto pt-15'>

            {/* ========== CULINARISTAS =========== */}
            <Text as='div' className='w-[80vw] mx-auto mt-20'>
                <Text as='p' className='
                    text-lg font-bold text-gray-dark
                    md:text-3xl
                '>
                    CULINARISTAS PARCEIROS
                </Text>
                <Text as='div' className='grid grid-cols-4 gap-10 w-full h-full mt-5'>
                    {culinaristas.map((c, i) => (
                        <Text as='div' key={i} className='h-full rounded-xl shadow-md'>
                            <Text as='div' className='w-auto h-80 rounded-t-xl'>
                                <Text as='img' src={c.foto} className='w-full h-full object-cover rounded-t-xl'/>
                            </Text>
                            <Text as='div' className='flex justify-between bg-white w-full rounded-b-xl p-4 items-center'> 
                                <Text as='p' className='font-semibold text-lg text-gray-dark'>{c.nomeCulinarista}</Text>
                                <Text as='p' className='bg-gray-base text-white text-sm rounded-2xl px-6 py-2'>{c.lojas.length === 2 ? 'Prado e Teresópolis' : c.lojas}</Text>
                            </Text>
                        </Text>
                    ))}
                </Text>
            </Text>

        </Text>
    )
}