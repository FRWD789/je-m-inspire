import { publicApi } from '@/api/api';
import { useEvent } from '@/context/EventContext'
import type { User } from '@/types/user'
import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Award, 
  Mail, 
  Globe, 
  Phone, 
  MessageCircle,
  Share2,
  BookOpen,
  BarChart3,
  Shield,
  Zap,
  CheckCircle,
  ArrowLeft,
  Users,
  Eye
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import EventCard from '@/features/events/components/EventCard';



export default function ProfessionalPublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { events } = useEvent();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserById = async () => {
      try {
        const res = await publicApi.get(`/user/${id}/public-profile`);
        setUser(res.data.data);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    };
    fetchUserById();
  }, [id]);

  const userEvents = useMemo(() => 
    events.filter((event) => event.creator?.id === user?.id),
    [events, user]
  );

  console.log(events)

  const stats = useMemo(() => ({
    total_events: userEvents.length,
    avg_rating: 4.5, // You might want to calculate this from actual event ratings
    reviews_count: userEvents.reduce((acc, event) => acc + (event.reviews_count || 0), 0),
    completion_rate: userEvents.length > 0 ? Math.round((userEvents.filter(e => e.status === 'completed').length / userEvents.length) * 100) : 0
  }), [userEvents]);

  const isProfessional = user?.professional?.is_professional || false;
  const hasProPlus = user?.subscription?.has_pro_plus || false;

  const handleShareProfile = () => {
    if (navigator.share && user) {
      navigator.share({
        title: `Profil de ${user.profile.name} ${user.profile.last_name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien du profil copié !');
    }
  };

  const handleContact = () => {
    alert('Fonction de contact à implémenter');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-accent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <span className="ml-3">Chargement du profil...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <h1 className="text-2xl font-semibold mb-4">Profil non trouvé</h1>
        <button 
          onClick={() => navigate("/")} 
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const fullName = `${user.profile.name} ${user.profile.last_name}`;
  const memberSince = user.professional?.professional_since ? new Date(user.professional?.professional_since).getFullYear() : null;

  return (
    <section className="bg-white min-h-screen">

    

      {/* Hero Section */}
      <div className="relative h-[50vh] w-full overflow-hidden rounded-t-[12px]">
              {/* Back Button */}
         <button
                  onClick={() => navigate("/events")}
                  className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 rounded-full p-2 z-50 text-white transition backdrop-blur-sm"
                  aria-label="Retour aux événements"
                >
                  <ArrowLeft size={20} />
        </button>
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-purple-600 to-indigo-700">
            {user.profile.profile_picture ? (
                  <img
                    src={user.profile.profile_picture}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null }
         
         
          <div className="absolute inset-0 bg-white/10  backdrop-blur-sm" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white">
                {user.profile.profile_picture ? (
                  <img
                    src={user.profile.profile_picture}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                    <span className=" text-2xl font-bold text-white ">
                      {user.profile.name[0]}{user.profile.last_name[0]}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Pro+ Badge */}
              {hasProPlus && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-2 shadow-lg">
                  <Star size={16} fill="currentColor" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl md:text-5xl text-white font-bold">{fullName}</h1>
                {hasProPlus && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap size={14} />
                    Pro+
                  </span>
                )}
                {isProfessional && (
                  <span className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 text-green-100">
                    <CheckCircle size={14} />
                    Professionnel
                  </span>
                )}
              </div>

              {user.profile.city && (
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin size={18} />
                  <span className="text-lg">{user.profile.city}</span>
                </div>
              )}

              {memberSince && (
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar size={16} />
                  <span>Membre depuis {memberSince}</span>
                </div>
              )}

              {/* Stats Overview */}
              <div className="flex gap-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total_events}</div>
                  <div className="text-sm text-white/80">Événements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.avg_rating}/5</div>
                  <div className="text-sm text-white/80">Note</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.completion_rate}%</div>
                  <div className="text-sm text-white/80">Réussite</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Bio Section */}
            {user.profile.biography && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-semibold mb-4">À propos</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {user.profile.biography}
                </p>
              </div>
            )}

            {/* Events Section */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-accent" />
                Événements organisés ({userEvents.length})
              </h2>
              
              {userEvents.length > 0 ? (
                  <Carousel
      opts={{
        align: "start",
      }}
      orientation="horizontal"
      className="w-full  "
    >
    <div className='flex items-center justify-between'>
            <p className='text-accent hover:underline  cursor-pointer' onClick={()=>navigate('/events')}>
                Voir tous les événements →
            </p>
      <div className='flex gap-x-[4px] items-center'>
              <CarouselPrevious  children/>
              <CarouselNext children/>
        
    </div>
    </div>
      <CarouselContent className=" h-full mt-[8px] py-2 px-4">
                
              {userEvents.map((event) => (
                <CarouselItem key={event.id} className="w-full  ">
                    <EventCard
                    event={event}/>
      </CarouselItem>
              ))}
            </CarouselContent>
   
          </Carousel>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun événement organisé pour le moment</p>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total_events}</div>
                <div className="text-sm text-gray-600">Événements créés</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                  {stats.avg_rating}
                  <Star size={16} className="text-yellow-400 fill-current" />
                </div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.reviews_count}</div>
                <div className="text-sm text-gray-600">Avis</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.completion_rate}%</div>
                <div className="text-sm text-gray-600">Taux de réussite</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShareProfile}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                <Share2 size={18} />
                Partager
              </button>
              
              <button 
                onClick={handleContact}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                <MessageCircle size={18} />
                Contacter
              </button>
            </div>

            {/* Contact Info */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-accent" />
                Contact
              </h3>
              
              <div className="space-y-3">
                {user.profile.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-sm">{user.profile.email}</span>
                  </div>
                )}
                
                {user.profile.city && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{user.profile.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pro Features */}
            {hasProPlus && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-900">
                  <Award size={20} />
                  Fonctionnalités Pro+
                </h3>
                
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-blue-800">
                    <BarChart3 size={18} />
                    <span>Analyses avancées</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-blue-800">
                    <Shield size={18} />
                    <span>Support prioritaire</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-blue-800">
                    <BookOpen size={18} />
                    <span>Rapports personnalisés</span>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Info */}
            {isProfessional && user.professional && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Professionnel vérifié</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {user.professional.commission_rate && (
                    <div className="flex justify-between">
                      <span>Commission:</span>
                      <span className="font-semibold">
                        {user.professional.commission_rate}%
                      </span>
                    </div>
                  )}
                  {user.professional.professional_since && (
                    <div className="flex justify-between">
                      <span>Professionnel depuis:</span>
                      <span className="font-semibold">
                        {new Date(user.professional.professional_since).getFullYear()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">Informations</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Membre depuis:</span>
                  <span className="font-semibold">
                    {memberSince}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Statut:</span>
                  <span className="font-semibold text-green-600">
                    {isProfessional ? 'Professionnel' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}