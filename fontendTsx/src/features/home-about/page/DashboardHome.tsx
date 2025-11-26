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
    </div>
  );
}