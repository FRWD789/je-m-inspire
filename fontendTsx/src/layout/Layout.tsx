import Footer from '@/components/Footer';
import NavBar from '@/components/navBar';
import { useAuth } from '@/context/AuthContext';
import React, { useLayoutEffect, useRef, useState, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Create Header Height Context
interface HeaderContextType {
  headerHeight: number;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function useHeaderHeight() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeaderHeight must be used within HeaderProvider');
  }
  return context;
}

export default function Layout() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation(); 
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const isHomePage = location.pathname === '/';
  const isAuth = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/register-pro' || location.pathname === "/reset-password" || location.pathname ==="/forgot-password";
  const isPublicEventsPage = location.pathname === '/events';

  return (
    <HeaderContext.Provider value={{ headerHeight }}>
      <>
        {!isAuth && (
          <header ref={headerRef} className="fixed top-0 left-0 w-full z-50">
            <NavBar />
          </header>
        )}
        
        <main
          className="flex flex-col bg-gradient-to-bl from-white to-background px-4"
          style={{ 
            // ✅ Utilise la hauteur optimale - headerHeight
            height: `calc(var(--full-height) - ${headerHeight}px)`,
            paddingTop: '32px',  // Espace en haut
            paddingBottom: '64px'  // Espace en bas
          }}
        >
          <Outlet />
        </main>
        
        {isHomePage && !isAuth && <Footer />}
      </>
    </HeaderContext.Provider>
  );
}