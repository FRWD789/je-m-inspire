// fontendTsx/src/components/LanguageSwitcher.tsx
import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Composant de changement de langue
 * 
 * Utilisation :
 * - Dans NavBar : <LanguageSwitcher />
 * - Dans Footer : <LanguageSwitcher />
 * - N'importe où dans l'app
 * 
 * Fonctionnalités :
 * - Bascule entre FR et EN
 * - Sauvegarde automatique dans localStorage
 * - Icône Globe + code langue (FR/EN)
 * - Tooltip informatif
 * - Accessible (aria-label)
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language.toUpperCase();
  const tooltipText = i18n.language === 'fr' 
    ? t('language.switchToEnglish')
    : t('language.switchToFrench');

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:text-accent transition-all rounded border border-secondary/30 hover:border-accent/50 hover:bg-accent/5"
      title={tooltipText}
      aria-label={`${t('language.changeLanguage')}. ${i18n.language === 'fr' ? t('language.currentFrench') : t('language.currentEnglish')}`}
    >
      <Globe className="w-4 h-4" />
      <span className="font-semibold">{currentLang}</span>
    </button>
  );
}

/**
 * VARIANTES DU COMPOSANT
 * ======================
 */

/**
 * Variante minimaliste (icône uniquement)
 */
export function LanguageSwitcherMini() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 text-primary hover:text-accent transition-all rounded-full hover:bg-accent/10"
      title={i18n.language === 'fr' ? t('language.switchToEnglish') : t('language.switchToFrench')}
      aria-label={t('language.changeLanguage')}
    >
      <Globe className="w-5 h-5" />
    </button>
  );
}

/**
 * Variante dropdown (si plus de 2 langues à l'avenir)
 */
export function LanguageSwitcherDropdown() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: t('language.currentFrench'), flag: '🇫🇷' },
    { code: 'en', name: t('language.currentEnglish'), flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:text-accent transition-all rounded border border-secondary/30 hover:border-accent/50"
        aria-label={t('language.changeLanguage')}
      >
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent/10 transition-colors ${
                i18n.language === lang.code ? 'bg-accent/5 font-semibold text-accent' : 'text-primary'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {i18n.language === lang.code && <Check className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}