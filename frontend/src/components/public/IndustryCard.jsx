import Text from "../Text"

export default function IndustryCard({
    industrias
}) {
    return (
        <Text>
            {industrias.map(i => (
                <Text as='p' key={i.id}>{i.nome}</Text>
            ))}
        </Text>
    )
}