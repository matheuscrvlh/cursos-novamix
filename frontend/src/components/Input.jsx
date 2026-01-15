import Text from "./Text"

export default function Input({
        type = 'text',
        placeholder = '',
        width,
        height,
        value,
        onChange,
        className = '',
        ...props
    }) {
    return (
        <Text 
            as='input'
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ width, height }}
            className={`p-2 border border-gray-base rounded-md text-gray-text ${className}`}
            {...props}
        />
    )
}