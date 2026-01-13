import Text from '../../components/Text'

export default function TopBar({title}) {
    return (
        <Text as='header' className='bg-gray w-full'>
            <Text as='h1' className='text-orange-base font-bold text-3xl pb-10'>{title}</Text>
        </Text>
    )
}