import React, { useState } from 'react';
import { Home, Calendar, Settings, PanelRight, PanelLeft, CalendarPlus2 } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import SideNav from '@/components/sideNav';

export default function Dashboard() {
  const [open, setOpen] = useState(true);

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home',path:"/profile" },
    { icon: <Calendar className="w-5 h-5" />, label: 'Events',path:"/events" },
    { icon: <CalendarPlus2 className="w-5 h-5" />, label: 'Mes Evenments',path:"/my-events" },

  ];

  return (
    <div className="flex h-screen bg-background transition-all">
      <SideNav open={open} width="16">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors" to={`/dashboard${item.path}`}            >
              {item.icon}
              <span className="ml-3 font-medium">{item.label}</span>
            </Link>
          ))}
        </ul>
      </SideNav>

          <main
        className="flex-1 flex flex-col px-6 py-[8px] transition-all duration-300"
        style={{ marginLeft: open ? '16rem' : '0rem', height: '100vh' }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="mb-4  p-2 bg-primary w-fit text-white rounded-lg shadow hover:bg-text transition-colors"
        >
          <PanelLeft/>
        </button>

        <div className="bg-[#F8F6F2] rounded-xl p-6 shadow flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
