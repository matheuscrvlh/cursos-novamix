import React from "react"

export default function CardDash({
  as = 'div',
  width,
  height,
  className = '',
  children,
  ...props
}) {
  return React.createElement(
    as,
    {
      style: {
        width,
        height
      },
      className: `bg-white rounded-mb shadow-sm ${className}`,
      ...props
    },
    children
  )
}
