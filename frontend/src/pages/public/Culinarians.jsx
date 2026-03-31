// REACT
import { useContext, useEffect, useState } from "react"

// COMPONENTS
import Text from "../../components/Text"

// SECTIONS
import AllCulinariansSections from "../../sections/culinarians/AllCulinariansSections"

// CONTEXT
import { DadosContext } from "../../contexts/DadosContext"

export default function Culinarians() {

    // CONTEXT
    const {
        culinaristas
    } = useContext(DadosContext)


    return (
        <Text as='section'>
            <AllCulinariansSections culinaristas={culinaristas}/>
        </Text>
    )
}