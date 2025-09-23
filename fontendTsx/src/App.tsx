import React, { useState } from 'react'
import Login from './pages/Login'

import Home from './pages/Home';
import { useAuth } from './context/AuthContext';
import Register from './pages/Register';

function App() {
      const [page, setPage] = useState("login");
      const {accessToken} = useAuth()

      
  return (
      <div>
        {accessToken ? <Home /> : <Register />}
      </div>
  )
}

export default App