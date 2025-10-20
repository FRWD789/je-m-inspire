import React, { useEffect, useState } from 'react';
import { Home, Calendar, Settings, PanelRight, PanelLeft, CalendarPlus2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import SideNav from '@/components/sideNav';

export default function Dashboard() {
  const [open, setOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(false); // dropdown state

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved) setOpen(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(open));
  }, [open]);

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: "/profile" },
    { icon: <Users className="w-5 h-5" />, label: 'Utilisateurs', path: "/approbation" },
    { 
      icon: <Calendar className="w-5 h-5" />, 
      label: 'Événements', 
      path: "/events",
      children: [
        { label: 'Mes événements', path: "/my-events", icon: <CalendarPlus2 className="w-4 h-4" /> },
      ]
    },
  ];

  return (
    <div className="flex h-screen bg-background transition-all">
      <SideNav open={open} width="16">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {!item.children ? (
                <Link
                  className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                  to={`/dashboard${item.path}`}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              ) : (
                    <div className="space-y-1">
                          <Link
                            to={`/dashboard${item.path}`} // par défaut "Tous les événements"
                            className="flex items-center w-full p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                            onClick={() => {
             
                              setEventsOpen(!eventsOpen);
                            }}
                          >
                            {item.icon}
                            <span className="ml-3 font-medium flex-1">{item.label}</span>
                            {eventsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Link>
                          {eventsOpen && (
                            <ul className="ml-6 space-y-1">
                              {item.children.map((child, cIndex) => (
                                <Link
                                  key={cIndex}
                                  className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors text-sm"
                                  to={`/dashboard${child.path}`}
                                >
                                  {child.icon && <span className="mr-2">{child.icon}</span>}
                                  {child.label}
                          </Link>
                    ))}
                      
                  </ul>
                )}
                <Link
                              className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                              to={`/dashboard/profile-settings`}
                            >
                              <Settings/>
                              <span className="ml-3 font-medium">Paramètre</span>
                </Link>
              </div>
              )}
            </React.Fragment>
          ))}
        </ul>
      </SideNav>

      <main
        className="flex-1 flex flex-col px-6 py-[8px] min-h-screen transition-all duration-300"
        style={{ marginLeft: open ? '16rem' : '0rem' }}
      >
        <div className='flex mb-4 sticky top-2 z-100  p-2 bg-[#F8F6F2] rounded-lg shadow-2xl w-full items-center gap-x-[24px]'>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 w-fit text-primary rounded-lg shadow transition-colors"
          >
            {open ? <PanelLeft size={20} /> : <PanelRight size={20} />}
          </button>
          <h2 className="text-lg text-left font-semibold">Tableau de bord</h2>
        </div>

        <div className="bg-[#F8F6F2] rounded-xl p-6 shadow flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
