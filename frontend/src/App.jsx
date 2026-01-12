import { Routes, Route } from 'react-router-dom'
import Home from './pages/public/Home'
import Login from './pages/admin/Login'

function App() {

  return (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
    </Routes>
  )
}

export default App
