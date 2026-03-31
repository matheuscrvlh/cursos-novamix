// REACT
import { useContext, useEffect, useState } from "react"

// COMPONENTS
import Text from "../../components/Text"

export default function CulinariansSections({ culinaristas }) {

    return (
        <Text as='section' className='w-full'>
            {culinaristas.slice(0,4).map((c, i) => (
                <Text as='div' key={i}>
                    <Text as='img' src={c.foto} className='w-10'/>
                    <Text>{c.nomeCulinarista}</Text>
                </Text>
            ))}
        </Text>
    )
}