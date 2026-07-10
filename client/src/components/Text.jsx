import React from 'react';

export default function Text({
    as = 'span',
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