import { Routes, Route } from 'react-router-dom'
import Home from './pages/public/Home'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Courses from './pages/admin/Courses'

function App() {

  return (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/cursos' element={<Courses />} />
    </Routes>
  )
}

export default App
