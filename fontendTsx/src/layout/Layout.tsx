import Footer from '@/components/Footer';
import NavBar from '@/components/navBar';
import { useAuth } from '@/context/AuthContext';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

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
    updateHeight(); // initial
    window.addEventListener('resize', updateHeight); // update on resize
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
   const isHomePage = location.pathname === '/';
   const isAuth =location.pathname === '/login'||location.pathname === '/register' || location.pathname==='/register-pro'

  return (
    <>
      {!isAuth&&<header ref={headerRef} className="fixed top-0  left-0 w-full z-50">
        <NavBar />
      </header>}
      <main
        className="bg-gradient-to-bl from-white pb-[32px] flex flex-col to-background min-h-screen px-4 sm:px-10 md:px-[60px]"
        style={{ paddingTop: `${headerHeight + 32}px` }}
      >
        <Outlet />
      </main>
      {isHomePage && <Footer />}
    </>
  );
}
