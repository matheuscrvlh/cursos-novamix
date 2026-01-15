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
            style: {width, height},
            className: `${className ? className : 'bg-orange-base shadow-md rounded-md text-white font-semibold hover:bg-orange-light cursor-pointer p-2'}`,
            ...props
        },
        children
    )
}