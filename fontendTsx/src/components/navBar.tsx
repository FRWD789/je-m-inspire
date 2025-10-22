import { Link, NavLink } from "react-router-dom";
import { ChevronDown, LogIn, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, isAuthenticated } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Événements", path: "/events" },
    { name: "Calendrier", path: "/calendar" },
    { name: "À propos", path: "/" },
    { name: "Remboursements", path: "/remboursements"}
  ];

  const dropdownLinks = [
    { name: "Méditation", path: "/" },
    { name: "Yoga & Mouvement", path: "/" },
    { name: "Sonothérapie", path: "/" },
    { name: "Cercles de partage", path: "/" },
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
              onClick={() => setOpenDropdown(!openDropdown)}
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

            {openDropdown && (
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
          {isAuthenticated ? (
            <NavLink to="/dashboard">
              <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden hover:ring-2 hover:ring-accent transition-all">
                {user?.profile_picture ? (
                  <img
                    src={`http://localhost:8000/storage/${user.profile_picture}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user?.name?.[0] || "U").toUpperCase()
                )}
              </div>
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent transition-all"
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </NavLink>

              <NavLink
                to="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:brightness-110 rounded-[4px] shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                S'inscrire
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
              <span className="text-sm font-medium text-primary">Expériences</span>
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
              {isAuthenticated ? (
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden">
                    {user?.profile_picture ? (
                      <img
                        src={`http://localhost:8000/storage/${user.profile_picture}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user?.name?.[0] || "U").toUpperCase()
                    )}
                  </div>
                  Mon compte
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" /> Se connecter
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:brightness-110 rounded-[4px] shadow-sm transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" /> S'inscrire
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