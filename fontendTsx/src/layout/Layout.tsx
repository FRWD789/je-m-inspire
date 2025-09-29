import { Outdent } from 'lucide-react'
import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/ui/NavBar'

export default function Layout() {
  return (
    <>

    <NavBar/>
     {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        <Outlet />
      </main>
 

    
    
    </>
  )
}