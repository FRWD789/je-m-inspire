import { Link, NavLink } from "react-router-dom";
import { ChevronDown, LogIn, UserPlus, Menu, X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types/user";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<false | "experiences" | "account">(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.events'), path: "/events" },
    { name: t('nav.about'), path: "/" },
    ...(user? [{name: t('dashboard.title'), path: "/dashboard"}]:[]),
    ...(user?.roles?.[0]?.role === "utilisateur" ? [{ name: t('nav.myReservations'), path: "/dashboard/my-reservations" }] : []),
    ...(user?.roles?.[0]?.role === "professionnel" ? [{ name: t('nav.createEvent'), path: "/dashboard/my-events" }] : []),
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
    <nav className="w-full px-3 sm:px-4 md:px-6 lg:px-10 xl:px-[60px] backdrop-blur-md border-b border-secondary/30">
      <div className="mx-auto flex items-center justify-between py-2 sm:py-3 md:py-4">
        {/* LOGO */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/" className="focus:outline-none">
            <img
              src="/assets/img/logo.png"
              alt="Logo"
              className="h-[clamp(2rem,4vw,3.5rem)] w-auto"
            />
          </Link>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map(({ name, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `text-xs xl:text-sm font-medium transition-all ${
                  isActive ? "text-accent" : "text-primary hover:text-accent"
                }`
              }
            >
              {name}
            </NavLink>
          ))}

          {/* DROPDOWN MENU - Experiences */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "experiences" ? false : "experiences")}
              onBlur={() => setTimeout(() => setOpenDropdown(false), 200)}
              className="flex items-center gap-1 text-xs xl:text-sm font-medium text-primary hover:text-accent transition-all"
            >
              Expériences
              <ChevronDown
                className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform ${
                  openDropdown === "experiences" ? "rotate-180 text-accent" : ""
                }`}
              />
            </button>

            {openDropdown === "experiences" && (
              <div className="absolute top-full mt-2 w-40 xl:w-48 bg-white/90 rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
                {dropdownLinks.map(({ name, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className="block px-3 xl:px-4 py-2 text-xs xl:text-sm text-primary hover:bg-background hover:text-accent transition-all"
                  >
                    {name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          
        </div>

        

        {/* DESKTOP AUTH LINKS */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
          <LanguageSwitcher/>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "account" ? false : "account")}
                onBlur={() => setTimeout(() => setOpenDropdown(false), 200)}
                className="w-8 h-8 xl:w-10 xl:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center bg-primary text-white overflow-hidden hover:border-accent transition-colors flex-shrink-0"
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


                 <div className="absolute right-0 mt-2 w-40 xl:w-48 bg-white/90 rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
                  {dropdownLinksAccount.map(({ name, path, icon }) => (
                    name.toLowerCase() === 'déconnexion' || name.toLowerCase() === 'logout' ? (
                      <button 
                        key={name}
                       onClick={() => {
                          logout();
                          setOpenDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 xl:px-4 py-2 text-xs xl:text-sm text-primary hover:bg-background hover:text-accent transition-all justify-between"
                      >
                        {name}
                      </button>
                    ) : (
                      <NavLink
                        key={path}
                        to={path}
                        onClick={() => setOpenDropdown(false)}
                        className="flex items-center gap-2 px-3 xl:px-4 py-2 text-xs xl:text-sm text-primary hover:bg-background hover:text-accent transition-all justify-between"
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
                className="flex items-center gap-1 xl:gap-2 px-2 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-medium text-primary hover:text-accent transition-all"
              >

                <LogIn className="w-3 h-3 xl:w-4 xl:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t('nav.login')}</span>
                <span className="sm:hidden">Connexion</span>

              </NavLink>

              <NavLink
                to="/register"
                className="flex items-center gap-1 xl:gap-2 px-2 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-medium text-white bg-accent hover:brightness-110 rounded-md transition-all flex-shrink-0"
              >
                <UserPlus className="w-3 h-3 xl:w-4 xl:h-4 flex-shrink-0" />
                <span className="hidden sm:inline"> {t('nav.register')}</span>
                <span className="sm:hidden">Inscription</span>

              </NavLink>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="lg:hidden flex items-center gap-2">
          {user && (
            <Link
              to="/dashboard/profile-settings"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-gray-300 flex items-center justify-center bg-primary text-white text-xs sm:text-sm overflow-hidden hover:border-accent transition-colors flex-shrink-0"
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
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md rounded-b-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="flex flex-col gap-1 px-3 sm:px-4 py-3 sm:py-4">
            {/* Nav Links */}
            {navLinks.map(({ name, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    isActive ? "text-accent bg-accent/10" : "text-primary hover:text-accent"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {name}
              </NavLink>
            ))}


            {/* Experiences Dropdown */}
            <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4">
              <span className="text-sm font-semibold text-primary px-2">{t('nav.experiences')}</span>
              <div className="flex flex-col gap-1 mt-2">

                {dropdownLinks.map(({ name, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className="px-4 py-1.5 text-sm text-primary hover:text-accent hover:bg-gray-50 rounded-md transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Auth Section */}
            <div className="flex flex-col gap-2 mt-4 sm:mt-6 border-t border-gray-200 pt-3 sm:pt-4">
              {user ? (
                <>
                  <NavLink
                    to="/dashboard/profile-settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent hover:bg-gray-50 rounded-md transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    Compte
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent hover:bg-gray-50 rounded-md transition-all text-left"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent hover:bg-gray-50 rounded-md transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4 flex-shrink-0" />
                    Se connecter
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-accent hover:brightness-110 rounded-md transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                    S'inscrire
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}