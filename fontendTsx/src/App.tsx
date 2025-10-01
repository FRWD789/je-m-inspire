import React, { useState } from 'react'
import Login from './pages/Login'
import {Routes,Route} from "react-router-dom"
import Home from './pages/Home';
import { useAuth } from './context/AuthContext';
import Register from './pages/Register';
import ProtectedRoutes from './components/ProtectedRoutes';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './laoyout/Dashboard';
import CreateEvent from './pages/CreateEvent';

function App() {

      
      
  return (
<Routes>
  <Route element={<ProtectedRoutes />}>
   <Route path="/dashboard" element={<Dashboard />} >
    <Route path='events' element={<CreateEvent/>}/>
  </Route>
  </Route>
 
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/verify-email" element={<VerifyEmail />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
</Routes>



    
      
  )
}

export default App