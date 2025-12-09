import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Target, 
  Heart, 
  Users, 
  Shield, 
  Sparkles,
  Mail,
  MapPin
} from 'lucide-react';
import Button from '@/components/ui/button';

export default function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: t('about.passionTitle'),
      description: t('about.passionDescription'),
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('about.communityTitle'),
      description: t('about.communityDescription'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('about.trustTitle'),
      description: t('about.trustDescription'),
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t('about.innovationTitle'),
      description: t('about.innovationDescription'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const stats = [
    { value: '10K+', label: t('about.eventsCreated') },
    { value: '50K+', label: t('about.activeUsers') },
    { value: '98%', label: t('about.customerSatisfaction') },
    { value: '24/7', label: t('about.supportAvailable') }
  ];

  return (
    <section className="grid gap-y-8 md:gap-y-12">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden rounded-lg md:rounded-[12px] shadow-xl">
        <img
          src="/assets/img/bg-hero.avif"
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 rounded-full p-2 z-50 text-white transition backdrop-blur-sm"
          aria-label={t('common.back')}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6 z-10">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('about.title')}
          </h1>
          <p className="text-white/90 text-base md:text-lg lg:text-xl max-w-2xl">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 border border-gray-200 text-center hover:shadow-md transition-shadow"
          >
            <p className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-lg md:rounded-[8px] p-6 md:p-10 border border-gray-200 shadow-sm">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
            <img
              src="/assets/img/mission.png"
              alt={t('about.ourMission')}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Texte */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('about.missionTitle')}</h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              {t('about.missionText1')}
            </p>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mt-4">
              {t('about.missionText2')}
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="grid gap-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">{t('about.valuesTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all group"
            >
              <div className={`${value.bgColor} ${value.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                {value.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-sm text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team/Story Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#B0A796]/30 to-[#81667A]/30 rounded-lg md:rounded-[8px] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">{t('about.historyTitle')}</h3>
          <p className="text-gray-700 leading-relaxed">
            {t('about.historyText1')}
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            {t('about.historyText2')}
          </p>
        </div>

        <div className="bg-accent/10 rounded-lg md:rounded-[8px] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">{t('about.whyChooseUsTitle')}</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>{t('about.securePayments')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>{t('about.intuitiveInterface')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>{t('about.affiliateProgram')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>{t('about.reactiveSupport')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>{t('about.completeDashboard')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact CTA Section */}
      <div className="bg-gradient-to-r from-accent to-primary rounded-lg md:rounded-[8px] p-6 md:p-10 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('about.contactTitle')}</h2>
        <p className="text-white/90 mb-6 max-w-xl mx-auto">
          {t('about.contactDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <Mail size={20} />
            <span>contact@jeminspire.com</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-white/30" />
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <span>Sherbrooke, Québec</span>
          </div>
        </div>
        <div className="mt-6">
          <Button 
            onClick={() => navigate('/events')}
            variant="secondary"
          >
            {t('about.discoverEvents')}
          </Button>
        </div>
      </div>
    </section>
  );
}