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
  TrendingUp
} from 'lucide-react';
// ✅ CORRECTION : Import depuis src/service/ et non src/features/home-about/service/
import { dashboardService, type DashboardStats } from '@/features/home-about/service/dashboardService';

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface QuickLink {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardHome() {
  const { user, hasProPlus } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

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

  // ✅ Charger les données du dashboard avec UN SEUL appel API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // ✅ UN SEUL appel API qui retourne toutes les stats selon le rôle
        const stats = await dashboardService.getStats();
        setDashboardData(stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Formater la date de réservation
  const formatTimeUntilEvent = (dateString?: string, daysUntil?: number): string => {
    if (!dateString) return '-';
    
    // Arrondir vers le haut pour éviter les décimales
    const days = daysUntil !== undefined ? Math.ceil(daysUntil) : null;
    
    if (days !== null) {
      if (days === 0) return t('common.today');
      if (days === 1) return t('common.tomorrow');
      return `${days} ${t('common.days')}`;
    }
    
    // Calcul manuel si nécessaire
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('common.today');
    if (diffDays === 1) return t('common.tomorrow');
    return `${diffDays} ${t('common.days')}`;
  };

  // ✅ Formater la prochaine réservation
  const formatNextReservation = (): string => {
    if (loading) return '...';
    if (!dashboardData.next_reservation) return '-';

    const { event_name, date, days_until } = dashboardData.next_reservation;
    const timeUntil = formatTimeUntilEvent(date, days_until);
    
    return `${event_name} - Dans ${timeUntil}`;
  };

  const quickStats: QuickStat[] = [
    ...(user?.roles[0]?.role === 'professionnel' ? [{
      label: t('dashboard.myEvents'),
      value: loading 
        ? '...' 
        : dashboardData.best_event
          ? `${dashboardData.best_event.name} (${dashboardData.best_event.reservations})`
          : '-',
      icon: <Ticket className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }] : []),
    {
      label: t('dashboard.nextEvent'),
      value: formatNextReservation(),
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    ...(user?.roles[0]?.role === 'professionnel' ? [{
      label: t('dashboard.earnings'),
      value: loading
        ? '...'
        : hasProPlus && dashboardData.monthly_earnings !== undefined
          ? `${dashboardData.monthly_earnings.toFixed(2)} $`
          : t('common.upgradeToPro'),
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }] : []),
    ...(user?.roles[0]?.role === 'admin' ? [{
      label: t('dashboard.users'),
      value: loading
        ? '...'
        : `${dashboardData.pending_approvals || 0} ${t('common.pending')}`,
      icon: <Users className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }] : [])
  ];

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

  return (
    <div className="space-y-6">
      {/* Header Section */}
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 break-words">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('dashboard.quickAccess')}
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

      {/* Upgrade Banner for Free Professionals */}
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