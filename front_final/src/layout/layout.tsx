import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (

    <main className='bg-gradient-to-bl px-[40px] min-h-screen from-white to-background'>
        <Outlet/>
    </main>
  )
}
