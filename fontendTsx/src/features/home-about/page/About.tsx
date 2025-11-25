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
      title: 'Passion',
      description: 'Nous croyons que chaque événement est une opportunité de créer des souvenirs inoubliables.',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Communauté',
      description: 'Connecter les organisateurs avec leur public est au cœur de notre mission.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Confiance',
      description: 'Sécurité des paiements et protection des données sont nos priorités absolues.',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Innovation',
      description: 'Nous améliorons constamment notre plateforme pour vous offrir la meilleure expérience.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Événements créés' },
    { value: '50K+', label: 'Utilisateurs actifs' },
    { value: '98%', label: 'Satisfaction client' },
    { value: '24/7', label: 'Support disponible' }
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
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6 z-10">

          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            À propos de Je m'inspire
          </h1>
          <p className="text-white/90 text-base md:text-lg lg:text-xl max-w-2xl">
            La plateforme qui connecte les passionnés aux événements qui les inspirent
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
              alt="Notre mission"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Texte */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Notre Mission</h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Je m'inspire est née d'une vision simple : rendre la découverte et l'organisation 
              d'événements accessible à tous. Que vous soyez un organisateur passionné cherchant 
              à partager votre expertise, ou un participant en quête de nouvelles expériences, 
              notre plateforme vous accompagne à chaque étape.
            </p>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mt-4">
              Nous croyons que les événements ont le pouvoir de transformer les vies, de créer 
              des connexions authentiques et d'inspirer le changement. C'est pourquoi nous mettons 
              tout en œuvre pour offrir une expérience fluide, sécurisée et enrichissante.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="grid gap-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">Nos Valeurs</h2>
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
          <h3 className="text-xl md:text-2xl font-semibold mb-4">Notre Histoire</h3>
          <p className="text-gray-700 leading-relaxed">
            Fondée par des passionnés d'événementiel, Je m'inspire est le fruit de plusieurs 
            années d'expérience dans l'organisation et la gestion d'événements. Face aux défis 
            rencontrés par les organisateurs indépendants, nous avons créé une solution qui 
            simplifie la billetterie, sécurise les paiements et favorise la visibilité.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Aujourd'hui, nous sommes fiers d'accompagner des milliers d'organisateurs et de 
            participants dans leurs aventures événementielles.
          </p>
        </div>

        <div className="bg-accent/10 rounded-lg md:rounded-[8px] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">Pourquoi nous choisir ?</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>Paiements sécurisés via Stripe et PayPal</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>Interface intuitive pour organisateurs et participants</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>Programme d'affiliation pour gagner des commissions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>Support réactif et accompagnement personnalisé</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">✓</span>
              <span>Tableau de bord complet pour suivre vos performances</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact CTA Section */}
      <div className="bg-gradient-to-r from-accent to-primary rounded-lg md:rounded-[8px] p-6 md:p-10 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Une question ? Contactez-nous</h2>
        <p className="text-white/90 mb-6 max-w-xl mx-auto">
          Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner 
          dans votre utilisation de la plateforme.
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
            Découvrir les événements
          </Button>
        </div>
      </div>
    </section>
  );
}