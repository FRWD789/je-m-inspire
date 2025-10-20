import React from 'react'
import Login from './page/Auth/login'
import { Routes ,Route} from 'react-router-dom'
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


export default function App() {
  return (

      <EventProvider>
        <Routes>
          <Route element={<PersistLogin/>}>
            <Route path='/' element={<Layout />}>
                  <Route index element={<Home/>}/>
                  <Route path='login' element={<Login/>}/>
                  <Route path='register' element={<Register/>}/>
                  <Route path='register-pro' element={<RegisterPro/>}/>
                  <Route path='events' element={<PublicEvents/>}/>
                  <Route path="events/:id" element={<EventDetail />} />
                  <Route path="calendar" element={<Calendar />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={["utilisateur","professionnel","admin"]} />}>
                    <Route path='/dashboard' element={<Dashboard/>}>
                          <Route path='profile-settings' element={<User/>}/>
                          <Route path='events' element={<Events/>}/>
                          <Route path='my-events' element={<MyEvents/>}/>
                          
                          <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
                                <Route path='approbation' element={<AdminApprovalPage/>}/>
                                
                          </Route>
                         
                    </Route>
            </Route>    
          </Route >
        </Routes>
 
      </EventProvider>
   

  )
}
