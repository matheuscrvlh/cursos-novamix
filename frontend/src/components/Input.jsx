export default function Input({
        type = 'text',
        placeholder = '',
        value,
        onChange,
        className = '',
        ...props
    }) {
    return (
        <input 
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`p-2 border border-gray-base rounded-md text-gray-text ${className || ''}`}
            {...props}
        />
    )
}