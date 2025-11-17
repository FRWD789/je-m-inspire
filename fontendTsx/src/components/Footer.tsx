import React from "react";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const navLinks = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.events'), path: "/" },
    { name: t('nav.createEvent'), path: "/" },
    { name: t('nav.about'), path: "/" },
  ];

  const experiences = [
    t('experiences.meditation'),
    t('experiences.yoga'),
    t('experiences.sonotherapy'),
    t('experiences.circles'),
  ];

  const communitySize = 5; // Number of avatars in “joined our community”

  // Function to generate random colors for avatars
  const getRandomColor = () =>
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

  return (
    <footer className="bg-primary text-white border-t border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 md:px-20 py-12 flex flex-col md:flex-row md:justify-between gap-10">
        
        {/* BRAND + DESCRIPTION */}
        <div className="flex-1">
          <img
            src="/assets/img/logo-white.png"
            alt="Logo"
            className="h-24 w-auto mb-4"
          />
          <p className="text-sm text-white">
            {t('footer.description')}
          </p>


        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 flex flex-col sm:flex-row gap-10">
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-3 text-sm">{t('footer.navigation')}</h4>
            <ul className="flex flex-col gap-2 text-sm">
              {navLinks.map(({ name, path }) => (
                <li key={path}>
                  <a
                    href={path}
                    className="hover:text-accent transition-colors"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h4 className="font-bold mb-3 text-sm">{t('nav.experiences')}</h4>
            <ul className="flex flex-col gap-2 text-sm">
              {experiences.map((exp, idx) => (
                <li key={idx}>
                  <a href="/" className="hover:text-accent transition-colors">
                    {exp}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="font-bold mb-3 text-sm">{t('footer.followUs')}</h4>
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-accent transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-accent transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-accent transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white mt-8 pt-4 text-center text-xs text-white">
        © {new Date().getFullYear()} Je m'inspire. {t('footer.copyright')}.
      </div>
    </footer>
  );
}
