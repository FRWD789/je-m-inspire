import React from 'react'
import Login from './page/Auth/login'
import { Routes ,Route} from 'react-router-dom'
import Layout from './layout/layout'
import Home from './page/home'
import User from './page/user'
import PrivateRoute from './components/privateRoute'
import PersistLogin from './components/persistLogin'
import Register from './page/Auth/register'
import Dashboard from './layout/dashboard'
import Events from './page/Events/Events'
import { EventProvider } from './context/EventContext'


export default function App() {
  return (

      <EventProvider>
    <Routes>
      <Route path='/' element={<Layout />}>
            <Route index element={<Home/>}/>
            <Route path='login' element={<Login/>}/>
            <Route path='register' element={<Register/>}/>
      </Route>
        <Route element={<PersistLogin/>}>
  
           <Route element={<PrivateRoute/>}>
                  <Route path='/dashboard' element={<Dashboard/>}>
                        <Route path='profile' element={<User/>}/>
                        <Route path='events' element={<Events/>}/>
                  </Route>
              </Route>
               

          
        </Route >
      </Routes>
      </EventProvider>
   

  )
}
