import React from 'react'

import { Navigate,Outlet, useActionData } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoutes() {
 

    const {accessToken,loading} = useAuth()


    
   if (loading) return <p>Loading...</p>;
  return accessToken ? <Outlet /> : <Navigate to="/login" />;


}
    

export default ProtectedRoutes