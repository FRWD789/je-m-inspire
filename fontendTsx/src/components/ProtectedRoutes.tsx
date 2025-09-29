import React from 'react'

import { Navigate,Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoutes() {

    const {accessToken} = useAuth()


    
  return accessToken? <Outlet/> : <Navigate to ="/login"/>


}
    

export default ProtectedRoutes