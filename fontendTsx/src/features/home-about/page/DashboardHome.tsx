import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Ticket, 
  BarChart3, 
  Users, 
  ArrowRight,
  Star,
  TrendingUp,
  Settings,
  CreditCard,
  HelpCircle,
  Bell,
  Plus,
  Eye,
  FileText,
  UserPlus,
  Search
} from 'lucide-react';

interface QuickLink {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

interface QuickAction {
  title: string;
  description: string;
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
}

export default function DashboardHome() {
  const { user, hasProPlus } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(t('dashboard.goodMorning'));
    } else if (hour < 18) {
      setGreeting(t('dashboard.goodAfternoon'));
    } else {
      setGreeting(t('dashboard.goodEvening'));
    }
  }, [t]);

  // ========================================
  // QUICK LINKS - Pages principales
  // ========================================
  const quickLinks: QuickLink[] = [
    ...(user?.roles[0]?.role === 'professionnel' ? [{
      title: t('dashboard.myEvents'),
      description: t('dashboard.manageYourEvents'),
      path: '/dashboard/my-events',
      icon: <Ticket className="w-5 h-5" />,
      color: 'blue'
    }] : []),
    {
      title: t('dashboard.myReservations'),
      description: t('dashboard.viewReservations'),
      path: '/dashboard/my-reservations',
      icon: <Calendar className="w-5 h-5" />,
      color: 'green'
    },
    ...(user?.roles[0]?.role === 'professionnel' ? [{
      title: t('dashboard.earnings'),
      description: t('dashboard.trackEarnings'),
      path: '/dashboard/vendor',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'purple'
    }] : []),
    ...(user?.roles[0]?.role === 'admin' ? [{
      title: t('dashboard.users'),
      description: t('dashboard.manageUsers'),
      path: '/dashboard/approbation',
      icon: <Users className="w-5 h-5" />,
      color: 'orange'
    }] : [])
  ];

  // ========================================
  // ACTIONS RAPIDES - Boutons d'actions
  // ========================================
  const quickActions: QuickAction[] = [
    ...(user?.roles[0]?.role === 'professionnel' ? [{
      title: t('dashboard.createEvent'),
      description: t('dashboard.createEventDesc'),
      onClick: () => navigate('/dashboard/my-events?create=true'),
      icon: <Plus className="w-5 h-5" />,
      color: 'blue'
    }] : []),
    {
      title: t('dashboard.browseEvents'),
      description: t('dashboard.browseEventsDesc'),
      onClick: () => navigate('/events'),
      icon: <Search className="w-5 h-5" />,
      color: 'green'
    },
    ...(user?.roles[0]?.role === 'professionnel' && hasProPlus ? [{
      title: t('dashboard.viewParticipants'),
      description: t('dashboard.viewParticipantsDesc'),
      onClick: () => navigate('/dashboard/my-events'),
      icon: <Users className="w-5 h-5" />,
      color: 'purple'
    }] : []),
  ];

  // ========================================
  // LIENS UTILES - Paramètres et aide
  // ========================================
  const utilityLinks: QuickLink[] = [
    {
      title: t('dashboard.profileSettings'),
      description: t('dashboard.manageProfile'),
      path: '/dashboard/profile-settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'gray'
    },
    ...(user?.roles[0]?.role === 'professionnel' ? [{
      title: t('dashboard.paymentAccounts'),
      description: t('dashboard.managePayments'),
      path: '/dashboard/profile-settings?tab=payment',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'gray',
      badge: !hasProPlus ? 'Pro+' : undefined
    }] : []),
    {
      title: t('dashboard.help'),
      description: t('dashboard.supportDocs'),
      path: '/help',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'gray'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ========================================
          HEADER SECTION
      ======================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {greeting}, {user?.profile?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.welcomeBack')}
          </p>
        </div>

        {/* Pro Plus Badge */}
        {user?.roles[0]?.role === 'professionnel' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            hasProPlus 
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            <Star size={20} fill={hasProPlus ? 'currentColor' : 'none'} />
            <span className="font-semibold">
              {hasProPlus ? 'Pro+' : t('common.freeAccount')}
            </span>
          </div>
        )}
      </div>

      {/* ========================================
          ACTIONS RAPIDES
      ======================================== */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚡ {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`bg-white rounded-lg p-4 border-2 border-dashed transition-all text-left group ${
                  action.disabled 
                    ? 'opacity-50 cursor-not-allowed border-gray-200' 
                    : 'border-gray-300 hover:border-blue-500 hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${action.color}-50 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================
          ACCÈS RAPIDE AUX PAGES PRINCIPALES
      ======================================== */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📂 {t('dashboard.quickAccess')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-${link.color}-50 text-${link.color}-600`}>
                      {link.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================
          LIENS UTILES - Paramètres et aide
      ======================================== */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔧 {t('dashboard.settings')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {utilityLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left group relative"
            >
              {link.badge && (
                <span className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                  {link.badge}
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${link.color}-50 text-${link.color}-600`}>
                  {link.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    {link.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {link.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================
          CONSEILS POUR LES NOUVEAUX UTILISATEURS
      ======================================== */}
      {user?.roles[0]?.role === 'professionnel' && !hasProPlus && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💡 {t('dashboard.tipsTitle')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>{t('dashboard.tip1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>{t('dashboard.tip2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>{t('dashboard.tip3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/dashboard/profile-settings?tab=plan')}
                className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {t('dashboard.learnMoreProPlus')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          BANNIÈRE UPGRADE (conservée en bas)
      ======================================== */}
      {user?.roles[0]?.role === 'professionnel' && !hasProPlus && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t('common.upgradeToPro')}
              </h3>
              <p className="text-blue-100">
                {t('common.unlockFeatures')}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/profile-settings?tab=plan')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              {t('common.upgradeNow')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}