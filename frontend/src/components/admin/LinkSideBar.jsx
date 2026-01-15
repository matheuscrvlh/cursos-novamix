// React
import { Link } from 'react-router-dom'

export default function LinkSideBar({
    to,
    children,
    className='bg-orange-base shadow-sm w-full rounded-md p-2 text-white font-semibold cursor-pointer hover:bg-orange-light'
}) {
    return (
        <Link 
            to={to}
            className={className}
        >
            {children}
        </Link>
    )
}