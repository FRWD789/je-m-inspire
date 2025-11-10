import React, { useEffect, useState } from 'react';
import { Home, Settings, PanelRight, PanelLeft, Users, ChevronDown, ChevronUp, HandCoins, BanknoteArrowDown, Ticket, TicketCheck, TicketPlus, CalendarDays, LogOut, Percent, ChartNoAxesCombined } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SideNav from '@/components/sideNav';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const [open, setOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(false);
  const { user ,logout} = useAuth();
  console.log(user)
  const location = useLocation(); // ✅ Get current path

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved) setOpen(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(open));
  }, [open]);

  // ✅ Check if current path matches or is a child of the link
  const isActive = (path: string) => {
    return location.pathname === `/dashboard${path}`;
  };

  const refundIcon =
    user!.roles[0].role === "admin" ? (
      <HandCoins className="w-5 h-5" />
    ) : (
      <BanknoteArrowDown className="w-5 h-5" />
    );

  const refundPath =
    user!.roles[0].role === "admin" ? "/refunds" : "/refunds-request";

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: "/" },
         ...(user!.roles[0].role ==="professionnel"? [{ icon: <ChartNoAxesCombined className="w-5 h-5" />, label: 'Revenus', path: "/vendor" }] : []),
    ...(user!.roles[0].role === "admin" ? [{ icon: <Users className="w-5 h-5" />, label: 'Utilisateurs', path: "/approbation" },{ icon: <Percent  className="w-5 h-5"/>, label: "Commissions", path: "/commissions" }] : []),
    { icon: refundIcon, label: "Remboursement", path: refundPath },
<<<<<<< Updated upstream

    { icon: <CalendarDays  className="w-5 h-5"/>, label: "Calandrier", path: "/event-calender" },
=======
    
    { icon: <CalendarDays  className="w-5 h-5"/>, label: "Calendrier", path: "/event-calender" },
>>>>>>> Stashed changes
    {
      icon: <Ticket  className="w-5 h-5" />,
      label: 'Événements',
      path: "/my-events",
      children: [
        { label: 'Événements', path: "/my-events", icon: <TicketPlus  className="w-4 h-4" /> },
        { label: 'Mes réservations', path: "/my-reservations", icon: <TicketCheck  className="w-4 h-4" /> },
      ]
    },
  ]

  return (
    <div className="flex h-screen bg-background transition-all">
      <SideNav open={open} width="16">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {!item.children ? (
                <Link
                  className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors ${
                    isActive(item.path) ? 'bg-primary/10 text-primary font-semibold' : ''
                  }`}
                  to={index==0? item.path:`/dashboard${item.path}`}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              ) : (
                <div className="space-y-1">
                  <Link
                    to={`/dashboard${item.path}`}
                    className={`flex items-center w-full p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors ${
                      isActive(item.path) ? 'bg-primary/10 text-primary font-semibold' : ''
                    }`}
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
                          className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors text-sm ${
                            isActive(child.path) ? 'bg-primary/10 text-primary font-semibold' : ''
                          }`}
                          to={`/dashboard${child.path}`}
                        >
                          {child.icon && <span className="mr-2">{child.icon}</span>}
                          {child.label}
                        </Link>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
          
          {/* Settings Link - Moved outside the loop */}
          <Link
            className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-background/50 transition-colors ${
              isActive('/profile-settings') ? 'bg-primary/10 text-primary font-semibold' : ''
            }`}
            to={`/dashboard/profile-settings`}
          >
            <Settings className="w-5 h-5" />
            <span className="ml-3 font-medium">Paramètres</span>
          </Link>
        </ul>
      </SideNav>

      <main
        className="flex-1 flex flex-col px-6 py-[8px] min-h-screen transition-all duration-300"
        style={{ marginLeft: open ? '16rem' : '0rem' }}
      >
        <div className='flex mb-4 justify-between sticky top-2 z-100 p-2 bg-[#F8F6F2] rounded-lg shadow-2xl w-full items-center gap-x-[24px]'>
        <div className='flex  gap-x-[24px] '>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 w-fit text-primary rounded-lg shadow transition-colors"
            >
              {open ? <PanelLeft size={20} /> : <PanelRight size={20} />}
            </button>
            <h2 className="text-lg text-left font-semibold">Tableau de bord</h2>
        </div>
        <div className='p-2 w-fit text-primary rounded-lg shadow transition-colors'>
          <LogOut   size={20} onClick={()=>logout()}/>
        </div>
          
        </div>

        <div className="bg-[#F8F6F2] rounded-xl p-6 shadow flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}