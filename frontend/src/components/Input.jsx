import React from "react"

export default function Input({
        as='input',
        className,
        placeholder,
        ...props
    }) {
    return React.createElement(as, {
        className: `${className ? className : 'w-[300px] p-2 bg-gray rounded-md border border-black'}`,
        placeholder,
        ...props
    })
}