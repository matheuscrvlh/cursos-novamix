import React from "react"

export default function CardDash({
    as='div',
    className,
    children,
    ...props
    }) {
    return React.createElement(
        as,
        {
            className: `${className ? className : 'bg-white h-[200px] w-[300px] rounded-md p-10 shadow-sm'}`,
            ...props
        },
        children
    )
}
