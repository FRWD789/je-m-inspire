import React, { useEffect, useState } from 'react';
import { Home, Settings, PanelRight, PanelLeft, Users, ChevronDown, ChevronUp, DollarSign, Ticket, TicketCheck, TicketPlus, CalendarDays, LogOut, Percent, BarChart3, Menu, X, Star, ArrowLeft  } from 'lucide-react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user, logout, hasProPlus } = useAuth();
  const { t } = useTranslation();
  
  const navigate = useNavigate();


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

 

  const refundIcon = user?.roles[0]?.role === 'admin' ? (
    <DollarSign className="w-5 h-5" />
  ) : (
    <DollarSign className="w-5 h-5" />
  );

  const refundPath = user?.roles[0]?.role === 'admin' ? '/dashboard/refunds' : '/dashboard/refunds-request';

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: t('dashboard.home'), path: '/dashboard' , exact: true},
    ...(user?.roles[0]?.role === 'professionnel'
      ? [{ icon: <BarChart3 className="w-5 h-5" />, label: t('dashboard.earnings'), path: '/dashboard/vendor' }]
      : []),
    ...(user?.roles[0]?.role === 'admin'
      ? [
          { icon: <Users className="w-5 h-5" />, label: t('dashboard.users'), path: '/dashboard/approbation' },
          { icon: <Percent className="w-5 h-5" />, label: t('dashboard.commissions'), path: '/dashboard/commissions' },
        ]
      : []),
    { icon: refundIcon, label: t('dashboard.refunds'), path: refundPath },
    { icon: <CalendarDays className="w-5 h-5" />, label: t('dashboard.calendar'), path: '/dashboard/event-calender' },
    {
      icon: <Ticket className="w-5 h-5" />,
      label: t('dashboard.events'),
      path: '/dashboard/my-events',
      children: [
        { label: t('dashboard.myEvents'), path: '/dashboard/my-events', icon: <TicketPlus className="w-4 h-4" /> },
        { label: t('dashboard.myReservations'), path: '/dashboard/my-reservations', icon: <TicketCheck className="w-4 h-4" /> },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinkItem = ({ item, isChild = false }) => (
    <NavLink
      to={item.path}
      end={item.exact || false}
      onClick={() => {
        if (isMobile) setMobileMenuOpen(false);
        if (!isChild) setEventsOpen(false);
      }}
      className={({ isActive }) =>
        `w-full flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors text-left ${
          isActive ? 'bg-blue-100 text-blue-600 font-semibold' : ''
        } ${isChild ? 'text-sm' : ''} ${!isMobile && sidebarOpen ? '' : 'whitespace-nowrap'}`
      }
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <span className={`ml-3 font-medium flex-1 ${isMobile || sidebarOpen ? 'block' : 'hidden'} truncate`}>
        {item.label}
      </span>
    </NavLink>
  );

   useEffect(() => {
  // Ouvrir automatiquement le dropdown si on est sur une route enfant
  const eventsItem = menuItems.find(item => item.children);
  if (eventsItem && eventsItem.children.some(child => location.pathname === child.path)) {
    setEventsOpen(true);
  }
}, [location.pathname]);

  const handleEventsToggle = (e, item) => {
    e.preventDefault();
    if (item.children && item.children.length > 0) {
      // Rediriger vers le premier enfant
      navigate(item.children[0].path);
      if (isMobile) setMobileMenuOpen(false);
    }
    setEventsOpen(!eventsOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay for mobile */}
      {mobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-16 md:top-0 left-0 bottom-0 md:bottom-auto bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-50 overflow-y-auto flex flex-col ${
          sidebarOpen && !isMobile ? 'w-64' : 'md:w-20 w-0'
        } ${mobileMenuOpen ? 'translate-x-0 w-64 sm:w-72' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
         <div className="hidden md:block">
           <NavLink 
              to="/" 
              onClick={() => setEventsOpen(false)}
              className={`font-bold text-center transition-all flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 ${sidebarOpen ? 'text-base' : 'text-xs'}`}
            >
              <ArrowLeft size={sidebarOpen ? 18 : 18} />
              {sidebarOpen && <span>Retour</span>}
            </NavLink>
          </div>
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                {!item.children ? (
                  <NavLinkItem item={item} />
                ) : (
                  <div onClick={() => setSidebarOpen(true)} className="space-y-1">
                    <button
                      onClick={(e) => handleEventsToggle(e, item)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${
                        eventsOpen ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className={`ml-3 font-medium flex-1 text-left ${
                        isMobile || sidebarOpen ? 'block' : 'hidden'
                      }`}>
                        {item.label}
                      </span>
                      {isMobile || sidebarOpen ? (
                        eventsOpen ? (
                          <ChevronUp className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        )
                      ) : null}
                    </button>
                    {eventsOpen && (
                      <ul className="space-y-1 ml-4">
                        {item.children.map((child, cIndex) => (
                          <div key={cIndex}>
                            <NavLinkItem item={child} isChild />
                          </div>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <NavLinkItem item={{ icon: <Settings className="w-5 h-5" />, label: t('dashboard.settings'), path: '/dashboard/profile-settings' }} />
            </div>
          </ul>
        </div>

        {/* User Profile Section - Bottom of Sidebar */}
        {user && (
          <div className="border-t border-gray-200 p-3 flex items-center md:p-4 space-y-3">
            {/* User Info Button */}
            <button
              className="flex items-center gap-2 w-full hover:bg-gray-100 px-2 py-2 rounded-lg transition group"
              onClick={() => {
                navigate("/dashboard/profile-settings");
                if (isMobile) setMobileMenuOpen(false);
              }}
              title= {t('dashboard.profileSettings')}
            >
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-full border-2 border-gray-300 hover:scale-110 transition flex items-center justify-center bg-primary text-white flex-shrink-0 overflow-hidden text-xs md:text-sm font-bold">
                {user.profile.profile_picture ? (
                  <img src={user.profile.profile_picture} alt={user.profile.name} className="w-full h-full object-cover" />
                ) : (
                  user.profile.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              
              <div className={`flex flex-col text-left flex-1 min-w-0 ${isMobile || sidebarOpen ? 'block' : 'hidden'}`}>
                <span className="font-medium text-sm truncate">{user.profile.name}</span>
                <span className="text-xs text-gray-500 truncate">
                  {user.subscription?.has_pro_plus ? 'Pro+' : t('common.freeAccount')}
                </span>
              </div>
               {/* Pro+ Badge or Upgrade Button */}
            {user.roles[0].role === 'professionnel' && (
              <div className={`flex flex-col text-left   ${isMobile || sidebarOpen ? 'block' : 'hidden'}`}>
                {!hasProPlus ? (
                  <button
                    onClick={() => {
                      navigate("/dashboard/profile-settings");
                      if (isMobile) setMobileMenuOpen(false);
                    }}
                    className={`w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-amber-400 text-amber-600 hover:bg-amber-50 transition ${
                      isMobile || sidebarOpen ? 'block' : 'hidden'
                    }`}
                  >
                     {t('common.upgradeAccount')}
                  </button>
                ) : (
                  <div className="w-full flex justify-center">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-2 shadow-lg hover:shadow-xl transition">
                      <Star size={16} fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
            )}
            </button>

           
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <button
                onClick={() => {
                  if (isMobile) {
                    setMobileMenuOpen(!mobileMenuOpen);
                  } else {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Toggle menu"
              >
                {isMobile ? (
                  mobileMenuOpen ? (
                    <X size={20} />
                  ) : (
                    <Menu size={20} />
                  )
                ) : sidebarOpen ? (
                  <PanelLeft size={20} />
                ) : (
                  <PanelRight size={20} />
                )}
              </button>
              <h2 className="text-base md:text-lg lg:text-xl font-semibold whitespace-nowrap truncate">
                {t('dashboard.title')}
              </h2>
            </div>
            <LanguageSwitcher/>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              title={t('nav.logout')}
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6">
          <div className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}