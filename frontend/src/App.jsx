// ======== REACT
import { Routes, Route } from 'react-router-dom'

// ======== PAGES
import Home from './pages/public/Home'
import Courses from './pages/public/Courses'
import ChildrensCourses from './pages/public/ChildrensCourses'
import Culinarians from './pages/public/Culinarians'
import Industries from './pages/public/Industries'

import Login from './pages/admin/Login'
import DashboardAdmin from './pages/admin/DashboardAdmin'
import CoursesAdmin from './pages/admin/CoursesAdmin'
import RegistrationsAdmin from './pages/admin/RegistrationsAdmin'
import CulinarianAdmin from './pages/admin/CulinarianAdmin'
import IndustriesAdmin from './pages/admin/IndustriesAdmin'
import ChildrenAdmin from './pages/admin/ChildrenAdmin'

export default function App() {
  return (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/cursos' element={<Courses />} />
        <Route path='/cursosInfantis' element={<ChildrensCourses />} />
        <Route path='/culinaristas' element={<Culinarians />} />
        <Route path='/industrias' element={<Industries />} />

        <Route path='/login' element={<Login />} />
        <Route path='/dashboardAdmin' element={<DashboardAdmin />} />
        <Route path='/cursosAdmin' element={<CoursesAdmin />} />
        <Route path='/inscricoesAdmin' element={<RegistrationsAdmin />} />
        <Route path='/culinaristasAdmin' element={<CulinarianAdmin />} />
        <Route path='/industriasAdmin' element={<IndustriesAdmin />} />
        <Route path='/infantisAdmin' element={<ChildrenAdmin />} />
    </Routes>
  )
}
