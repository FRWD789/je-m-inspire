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

function App() {

      
      
  return (

    <Routes>
      <Route path='/login' element={<Login/>} />

      <Route path='/register' element={<Register/>} />

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
      </Route>
    </Routes>


    
      
  )
}

export default App