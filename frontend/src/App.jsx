// ======== REACT
import { Routes, Route } from 'react-router-dom'

// ======== PAGES
import Home from './pages/public/Home'
import Courses from './pages/public/Courses'
import Culinarians from './pages/public/Culinarians'

import Login from './pages/admin/Login'
import DashboardAdmin from './pages/admin/DashboardAdmin'
import CoursesAdmin from './pages/admin/CoursesAdmin'
import RegistrationsAdmin from './pages/admin/RegistrationsAdmin'
import CulinarianAdmin from './pages/admin/CulinarianAdmin'
import IndustriesAdmin from './pages/admin/IndustriesAdmin'

export default function App() {
  return (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/cursos' element={<Courses />} />
        <Route path='/culinaristas' element={<Culinarians />} />

        <Route path='/login' element={<Login />} />
        <Route path='/dashboardAdmin' element={<DashboardAdmin />} />
        <Route path='/cursosAdmin' element={<CoursesAdmin />} />
        <Route path='/inscricoesAdmin' element={<RegistrationsAdmin />} />
        <Route path='/culinaristasAdmin' element={<CulinarianAdmin />} />
        <Route path='/industriasAdmin' element={<IndustriesAdmin />} />
    </Routes>
  )
}
