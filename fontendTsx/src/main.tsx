import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from './App.tsx'
import { AuthContextProvider } from './context/AuthContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import './i18n/config'

createRoot(document.getElementById('root')!).render(
  
    <BrowserRouter>
     <AuthContextProvider>
     <App />
    </AuthContextProvider>
    </BrowserRouter>
   

 ,
)
