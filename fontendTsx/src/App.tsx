// fontendTsx/src/App.tsx
import React from 'react'
import Login from './page/Auth/login'
import { Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Home from './page/home'
import User from './page/user'
import PrivateRoute from './components/privateRoute'
import PersistLogin from './components/persistLogin'
import Register from './page/Auth/register'
import Dashboard from './layout/dashboard'
import Events from './page/Events/Events'
import { EventProvider } from './context/EventContext'
import MyEvents from './page/Events/MyEvents'
import PublicEvents from './page/publicEvents'
import EventDetail from './page/eventDeatail'
import AdminApprovalPage from './components/userAprrobation'
import RegisterPro from './page/Auth/registerPro'
import Calendar from './page/calendar'
import { useAuth } from './context/AuthContext'
import PaymentSuccess from './page/payment/PaymentSuccess' // ✅ AJOUT
import RemboursementsPage from './page/remboursements';


export default function App() {
  const { loading, isInitialized } = useAuth();

  // ✅ Afficher un loader tant que l'initialisation n'est pas terminée
  if (!isInitialized || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Chargement de l'application...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <EventProvider>
      <Routes>
        <Route element={<PersistLogin />}>
          <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path='register-pro' element={<RegisterPro />} />
            <Route path='events' element={<PublicEvents />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="calendar" element={<Calendar />} />
            <Route element={<PrivateRoute allowedRoles={["utilisateur", "admin"]} />}>
              <Route path="/remboursements" element={<RemboursementsPage />} />
            </Route>
          </Route>
         


          {/* ✅ AJOUT : Route PaymentSuccess protégée */}
          <Route element={<PrivateRoute allowedRoles={["utilisateur", "professionnel", "admin"]} />}>
            <Route path='/payment/success' element={<PaymentSuccess />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["utilisateur", "professionnel", "admin"]} />}>
            <Route path='/dashboard' element={<Dashboard />}>
              <Route path='profile-settings' element={<User />} />
              <Route path='events' element={<Events />} />
              <Route path='my-events' element={<MyEvents />} />

              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path='approbation' element={<AdminApprovalPage />} />
              </Route>


            </Route>
          </Route>

          
        </Route >
      </Routes>
    </EventProvider>
  )
}