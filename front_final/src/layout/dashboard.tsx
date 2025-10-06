import React, { useState } from 'react';
import SideNav from '../components/sideNav';
import { Home, Calendar, Settings } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex bg-white">
      <SideNav open={open} width='16'>
        <ul className="space-y-2" >
          <li className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
            <Home className="w-5 h-5 mr-2" />
            <span>Home</span>
          </li>
          <li className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
            <Calendar className="w-5 h-5 mr-2" />
            <span>Event</span>
          </li>
          <li className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
            <Settings className="w-5 h-5 mr-2" />
            <span>Settings</span>
          </li>
        </ul>
      </SideNav>

      <main className="flex-1 p-4 transition-all min-h-screen rounded-[16px] bg-background" style={{ marginLeft: open ? '16rem' : '0rem' }}>
        <button
          onClick={() => setOpen(!open)}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Toggle Sidebar
        </button>

        <Outlet/>
        
      </main>
    </div>
  );
}
