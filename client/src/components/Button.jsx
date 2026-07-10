import React from "react"

export default function Button({ 
        as='button',
        width,
        height,
        className,
        children,
        ...props
    }) {
    return React.createElement(
        as,
        {   
            style: {width, height },
            className: `shadow-md rounded-md font-semibold cursor-pointer p-2 ${className}`,
            ...props
        },
        children
    )
}