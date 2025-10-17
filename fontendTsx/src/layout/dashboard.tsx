import React, { useEffect, useState } from 'react';
import { Home, Calendar, Settings, PanelRight, PanelLeft, CalendarPlus2 } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import SideNav from '@/components/sideNav';

export default function Dashboard() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved) setOpen(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(open));
  }, [open]);
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
        className="flex-1 flex flex-col px-6 py-[8px] shadow-sm min-h-screen transition-all duration-300"
        style={{ marginLeft: open ? '16rem' : '0rem' }}
      >
       <div className='flex mb-4 sticky top-2 z-100  p-2 bg-[#F8F6F2]  rounded-lg shadow-sm w-full  te items-center gap-x-[24px]'>
          <button
            onClick={() => setOpen(!open)}
            className=" p-2  w-fit text-primary rounded-lg shadow  transition-colors"
          >
              {open ? <PanelLeft size={20} /> : <PanelRight size={20} />}
          </button>
           <h2 className="text-lg text-left font-semibold">Tableau de bord</h2>
       </div>

        <div className="bg-[#F8F6F2] rounded-xl p-6 shadow flex-1 ">
          <Outlet />
        </div>
      </main>
    </div>
    
  );
}
