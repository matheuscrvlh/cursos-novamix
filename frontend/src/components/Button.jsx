import React from "react"

export default function Button({ 
        as='button',
        className,
        children,
        ...props
    }) {
    return React.createElement(
        as,
        {
            className: `${className ? className : ''}`,
            ...props
        },
        children
    )
}