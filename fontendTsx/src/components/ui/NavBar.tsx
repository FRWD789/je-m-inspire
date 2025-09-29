import React, { useState } from "react";
import { Link, NavLink,type NavLinkRenderProps } from "react-router-dom";
import { Menu, X } from "lucide-react";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  const navLinkClass = ( {isActive}:NavLinkRenderProps ) =>
    `transition-colors duration-200 hover:text-accent-me ${
      isActive ? "text-accent-me font-semibold" : "text-text"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="assets/img/logo.png"
            className="w-20 sm:w-24"
            alt="Je m'inspire"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {navItems.map((el) => (
            <NavLink to={el.path} key={el.path} className={navLinkClass}>
              {el.name}
            </NavLink>
          ))}
        </div>

        {/* Auth links */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/login" className="text-gray-700 hover:text-accent-me">
            Se Connecter
          </NavLink>
          <NavLink
            to="/register"
            className="px-4 py-2 rounded-full bg-accent-me text-white font-medium hover:bg-accent-me/50 transition"
          >
            S'inscrire
          </NavLink>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-start gap-4 px-6 py-4 bg-accent backdrop-blur-md shadow-md">
          {navItems.map((el) => (
            <NavLink
              to={el.path}
              key={el.path}
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {el.name}
            </NavLink>
          ))}
          <div className="flex flex-col gap-2 w-full">
            <NavLink
              to="/login"
              className="text-gray-700 hover:text-accent"
              onClick={() => setMenuOpen(false)}
            >
              Se Connecter
            </NavLink>
            <NavLink
              to="/register"
              className="px-4 py-2 rounded-full bg-accent text-white font-medium hover:bg-primary transition text-center"
              onClick={() => setMenuOpen(false)}
            >
              S'inscrire
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
