import { Routes, Route } from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop'

import Home from './pages/public/Home'
import Courses from './pages/public/Courses'
import ChildrensCourses from './pages/public/ChildrensCourses'
import Culinarians from './pages/public/Culinarians'
import Industries from './pages/public/Industries'
import CoursePage from './pages/public/CoursePage'
import Login from './pages/public/Login'
import Cadastro from './pages/public/Cadastro'
import MinhaConta from './pages/public/MinhaConta'
import EsqueciSenha from './pages/public/EsqueciSenha'
import RedefinirSenha from './pages/public/RedefinirSenha'

import RequireAuth from './components/RequireAuth'
import DashboardAdmin from './pages/admin/DashboardAdmin'
import CoursesAdmin from './pages/admin/CoursesAdmin'
import RegistrationsAdmin from './pages/admin/RegistrationsAdmin'
import CulinarianAdmin from './pages/admin/CulinarianAdmin'
import IndustriesAdmin from './pages/admin/IndustriesAdmin'
import ChildrensAdmin from './pages/admin/ChildrensAdmin'
import MarketingAdmin from './pages/admin/MarketingAdmin'
import ClientesAdmin from './pages/admin/ClientesAdmin'
import LogsAdmin from './pages/admin/LogsAdmin'

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/cursos' element={<Courses />} />
        <Route path='/cursosInfantis' element={<ChildrensCourses />} />
        <Route path='/culinaristas' element={<Culinarians />} />
        <Route path='/industrias' element={<Industries />} />
        <Route path='/curso/:id' element={<CoursePage />} />
        <Route path='/entrar' element={<Login />} />
        <Route path='/cadastro' element={<Cadastro />} />
        <Route path='/minha-conta' element={<MinhaConta />} />
        <Route path='/esqueci-senha' element={<EsqueciSenha />} />
        <Route path='/redefinir-senha' element={<RedefinirSenha />} />

        <Route element={<RequireAuth />}>
          <Route path='/dashboardAdmin' element={<DashboardAdmin />} />
          <Route path='/cursosAdmin' element={<CoursesAdmin />} />
          <Route path='/inscricoesAdmin' element={<RegistrationsAdmin />} />
          <Route path='/culinaristasAdmin' element={<CulinarianAdmin />} />
          <Route path='/industriasAdmin' element={<IndustriesAdmin />} />
          <Route path='/infantisAdmin' element={<ChildrensAdmin />} />
          <Route path='/marketingAdmin' element={<MarketingAdmin />} />
          <Route path='/clientesAdmin' element={<ClientesAdmin />} />
          <Route path='/logsAdmin' element={<LogsAdmin />} />
        </Route>
    </Routes>
    </>
  )
}
