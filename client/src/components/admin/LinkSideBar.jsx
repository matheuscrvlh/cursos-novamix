import { NavLink } from 'react-router-dom'

export default function LinkSideBar({ to, children, onClick }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => `
                shadow-sm w-full rounded-md p-2 font-semibold cursor-pointer transition-colors text-center block
                ${isActive
                    ? 'bg-orange-base text-white'
                    : 'bg-gray text-gray-text hover:bg-orange-base/10 hover:text-orange-base'
                }
            `}
        >
            {children}
        </NavLink>
    )
}
