import { Routes, Route } from 'react-router-dom'
import Home from './pages/public/Home'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Courses from './pages/admin/Courses'
import Registrations from './pages/admin/Registrations'
import Culinarian from './pages/admin/Culinarian'

function App() {

  return (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/cursos' element={<Courses />} />
        <Route path='/inscricoes' element={<Registrations />} />
        <Route path='/culinaristas' element={<Culinarian />} />
    </Routes>
  )
}

export default App
