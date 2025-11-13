import { Link, NavLink } from "react-router-dom";
import { ChevronDown, LogIn, UserPlus, Menu, X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types/user";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function NavBar() {
  const {user,logout} = useAuth()
  const [openDropdown, setOpenDropdown] = useState<false | "experiences" | "account">(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();


  const navLinks = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.events'), path: "/events" },
    { name: t('nav.createEvent'), path: "/dashboard/my-events" },
    { name: t('nav.about'), path: "/" },
    ...(user ? [{ name: t('nav.myReservations'), path: "/dashboard/my-reservations" }] : []),
  ];

  const dropdownLinks = [
    { name: t('experiences.meditation'), path: "/" },
    { name: t('experiences.yoga'), path: "/" },
    { name: t('experiences.sonotherapy'), path: "/" },
    { name: t('experiences.circles'), path: "/" },
  ];

  const dropdownLinksAccount = [
    { name: t('nav.account'), path: "/dashboard/profile-settings", icon: <ExternalLink /> },
    { name: t('nav.logout'), path: "/" },
  ];


  return (
    <nav className="w-full px-4 sm:px-10 md:px-[60px] backdrop-blur-md border-b border-secondary/30">
      <div className="mx-auto flex items-center justify-between py-3">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <img
            src="/assets/img/logo.png"
            alt="Logo"
            className="h-[clamp(2.5rem,5vw,6rem)] w-auto"
          />
          </Link>
        
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ name, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `text-sm font-medium transition-all ${
                  isActive ? "text-accent" : "text-primary hover:text-accent"
                }`
              }
            >
              {name}
            </NavLink>
          ))}

          {/* DROPDOWN MENU */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "experiences" ? false : "experiences")}
              onBlur={() => setTimeout(() => setOpenDropdown(false), 200)}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-all"
            >
              Expériences
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdown ? "rotate-180 text-accent" : ""
                }`}
              />
            </button>

            {openDropdown === "experiences" && (
              <div className="absolute top-full mt-2 w-48 bg-white/90 rounded-[8px] shadow-lg border border-gray-100 overflow-hidden">
                {dropdownLinks.map(({ name, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className="block px-4 py-2 text-sm text-primary hover:bg-background hover:text-accent transition-all"
                  >
                    {name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          
        </div>

        

        {/* DESKTOP AUTH LINKS */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher/>
           {user as User ? (
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "account" ? false : "account")}
                onBlur={() => setTimeout(() => setOpenDropdown(false), 200)}
                className="w-10 h-10 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden"
              >
                {user?.profile.profile_picture ? (
                  <img
                    src={user.profile.profile_picture}
                    alt="avatar"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  user?.profile?.name?.[0] || "U"
                )}
              </button>

              {openDropdown === "account" && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 rounded-[8px] shadow-lg border border-gray-100 overflow-hidden">
                  {dropdownLinksAccount.map(({ name, path, icon }) => (
                    name.toLowerCase() === 'déconnexion' || name.toLowerCase() === 'logout' ? (
                      <button 
                        key={name}
                        onClick={() => logout()} 
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-background justify-between hover:text-accent transition-all"
                      >
                        {name}
                      </button>
                    ) : (
                      <NavLink
                        key={path}
                        to={path}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-background justify-between hover:text-accent transition-all"
                      >
                        {name}
                        {icon && <span>{icon}</span>}
                      </NavLink>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent transition-all"
              >
                <LogIn className="w-4 h-4" />
                {t('nav.login')}
              </NavLink>

              <NavLink
                to="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:brightness-110 rounded-[4px] shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                {t('nav.register')}
              </NavLink>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md rounded-b-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            {navLinks.map(({ name, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-all ${
                    isActive ? "text-accent" : "text-primary hover:text-accent"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {name}
              </NavLink>
            ))}

            {/* Dropdown items */}
            <div className="mt-2 border-t border-gray-200 pt-2">
              <span className="text-sm font-medium text-primary">{t('nav.experiences')}</span>
              <div className="flex flex-col mt-1 gap-1">
                {dropdownLinks.map(({ name, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className="text-sm text-primary hover:text-accent transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Auth links */}
            <div className="flex flex-col gap-2 mt-4 border-t border-gray-200 pt-2">
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" /> {t('nav.login')}
              </NavLink>

              <NavLink
                to="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:brightness-110 rounded-[4px] shadow-sm transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="w-4 h-4" /> {t('nav.register')}
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
