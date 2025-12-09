import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import usePrivateApi from '@/hooks/usePrivateApi';
import { PayementService } from '@/features/payment/service/paymentService';
import { Calendar, MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import type { User } from '@/types/user';
import ImageCarousel from '@/features/events/components/ImageCarousel';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { useTranslation } from 'react-i18next';

// --- Types ---
interface Event {
  id: string | number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: number;
  capacity: number;
  available_places?: number;
  thumbnail?: string;
  banner?: string;
  images?: Array<{
    id: number;
    url: string;
    display_order: number;
  }>;
  localisation: {
    address?: string;
  };
  creator?: {
    name: string;
    profile_picture?: string;
  };
  categorie?: {
    name: string;
  };
}

interface ReservationCardProps {
  event: Event;
  user: any;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  method: 'stripe' | 'paypal';
  setMethod: (method: 'stripe' | 'paypal') => void;
  handleCheckout: () => void;
  location: any;
  navigate: any;
}

// --- Subcomponents ---
const HeroSection = ({ event, navigate }: { event: Event; navigate: any }) => {
  const { t, i18n } = useTranslation();
  
  const eventDate = useMemo(() => 
    new Date(event.start_date).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: "long",
      day: "numeric",
      month: "long",
    }), [event.start_date, i18n.language]
  );

  return (
    <div className="relative h-[40vh] w-full overflow-hidden rounded-t-[12px]">
      <ResponsiveImage
        src={event.banner_path || event.thumbnail_path}
        variants={event.banner_variants || event.thumbnail_variants}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        loading="eager"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/15 flex flex-col justify-end p-8 text-white">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition backdrop-blur-sm"
          aria-label={t('eventDetail.backToEvents')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-200 flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            {eventDate}
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={16} /> 
            {event.localisation.address || t('eventDetail.addressToCome')}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrganizerInfo = ({ creator }: { creator?: User }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  
  const hasValidProfilePicture = creator?.profile.profile_picture && 
                                  creator.profile.profile_picture.trim() !== '' &&
                                  !imageError;

  return (
    <div className="h-fit rounded-2xl p-6 border border-gray-100 shadow-md bg-white">
      <h3 className="text-xl font-semibold mb-4">{t('eventDetail.organizer')}</h3>
      <Link to={`/user/${creator?.id}`} className="block hover:opacity-80 transition">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden">
            {hasValidProfilePicture ? (
              <img 
                src={creator.profile.profile_picture} 
                alt={t('eventDetail.photoOf', { name: creator.profile.name })}
                loading="lazy"        
                decoding="async"     
                className="w-full h-full object-cover object-center"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="font-semibold text-lg">
                {creator?.profile.name?.[0]?.toUpperCase() || 'T'}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('eventDetail.organizedBy')}</p>
            <p className="font-semibold text-gray-800 text-lg">{creator?.profile.name || t('eventDetail.anonymousOrganizer')}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

const ReservationCard: React.FC<ReservationCardProps> = ({
  event,
  user,
  expanded,
  setExpanded,
  method,
  setMethod,
  handleCheckout,
  location,
  navigate
}) => {
  const { t } = useTranslation();
  const total = event.base_price;

  const handleReserveClick = useCallback(() => {
    if (!user) {
      alert(t('eventDetail.mustBeLoggedIn'));
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    setExpanded(true);
  }, [user, navigate, location, setExpanded, t]);

  return (
    <aside className="h-fit rounded-2xl p-6 border border-gray-100 shadow-md flex flex-col gap-4 bg-white relative">
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"
          aria-label={t('common.close')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      <h3 className="text-xl font-semibold">{t('eventDetail.reserveYourSpot')}</h3>

      {!expanded && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{event.base_price} $</span>
          </div>
          <button
            className="w-full py-3 bg-accent text-white rounded-[8px] hover:bg-primary transition font-medium"
            onClick={handleReserveClick}
          >
            {t('eventDetail.reserveNow')}
          </button>
        </>
      )}

      {expanded && user && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xl font-bold text-indigo-600">
            <span>{t('eventDetail.total')}</span>
            <span>{total} $</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-gray-700 font-semibold">{t('eventDetail.paymentMethod')}</h4>
            <div className="flex gap-3">
              {["stripe", "paypal"].map((m) => (
                <label
                  key={m}
                  className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                    method === m ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input 
                    type="radio" 
                    name="method" 
                    checked={method === m} 
                    onChange={() => setMethod(m as 'stripe' | 'paypal')} 
                    className="hidden" 
                  />
                  {m === "stripe" ? 
                    <CreditCard className="w-5 h-5 text-indigo-600" /> : 
                    <span className="text-indigo-600 font-bold">PP</span>
                  }
                  {m === "stripe" ? "Stripe" : "PayPal"}
                </label>
              ))}
            </div>
          </div>

          <button
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCheckout}
            disabled={!method}
          >
            <CreditCard className="w-5 h-5" />
            {t('eventDetail.proceedToPayment')}
          </button>
        </div>
      )}

      {!user && expanded && (
        <p className="text-red-600 mt-2 text-sm text-center">
          {t('eventDetail.mustBeLoggedInToReserve')}
        </p>
      )}
    </aside>
  );
};

interface MapSectionProps {
  address?: string;
}

const MapSection: React.FC<MapSectionProps> = ({ address }) => {
  const { t } = useTranslation();
  
  const mapSrc = useMemo(() => 
    address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : '',
    [address]
  );

  if (!address) {
    return <p className="text-gray-500 italic">{t('eventDetail.addressNotAvailable')}</p>;
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <iframe
        title={t('eventDetail.eventLocation')}
        src={mapSrc}
        width="100%"
        height="100%"
        className="border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

// --- Main Component ---
export default function EventDetail() {
  const { t } = useTranslation();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, fetchEventById, loading } = useEvent();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [method, setMethod] = useState<'stripe' | 'paypal'>('stripe');
  const api = usePrivateApi();
  
  const paymentService = useMemo(() => PayementService(api), [api]);

  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id]);

  const handleCheckout = useCallback(async () => {
    if (!user || !event?.id) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    try {
      const response = method === 'stripe'
        ? await paymentService.createStripeCheckout(event.id)
        : await paymentService.createPaypalCheckout(event.id);

      const redirectUrl = method === 'stripe' ? response?.url : response?.approval_url;
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert(error.response?.data?.error || t('eventDetail.paymentError'));
    }
  }, [user, event?.id, method, paymentService, navigate, location, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-accent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <span className="ml-3">{t('eventDetail.loadingEvent')}</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-accent">
        <h1 className="text-2xl font-semibold mb-4">{t('eventDetail.eventNotFound')}</h1>
        <button 
          onClick={() => navigate("/events")} 
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-primary transition"
        >
          {t('eventDetail.backToList')}
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white/40 backdrop-blur-3xl min-h-screen">
      <HeroSection event={event} navigate={navigate} />
      
      <div className="px-[42px] py-[24px]">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Colonne gauche - Organisateur + Photos */}
          <div className="order-1 lg:order-none lg:w-1/2 lg:flex lg:flex-col lg:gap-6">
            <OrganizerInfo creator={event.creator} />
            
            {/* Photos - Desktop seulement */}
            <div className="hidden lg:block">
              {event.images && event.images.length > 0 ? (
                <ImageCarousel images={event.images} />
              ) : (
                <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <p className="text-gray-400">{t('eventDetail.noImagesAvailable')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Réservation + Description */}
          <div className="order-2 lg:order-none lg:w-1/2 lg:flex lg:flex-col lg:gap-6">
            <ReservationCard
              event={event}
              user={user}
              expanded={expanded}
              setExpanded={setExpanded}
              method={method}
              setMethod={setMethod}
              handleCheckout={handleCheckout}
              location={location}
              navigate={navigate}
            />
            
            {/* Description - Desktop seulement */}
            <div className="hidden lg:block rounded-2xl p-6 border border-gray-100 shadow-md bg-white">
              <h2 className="text-2xl font-semibold mb-4">{t('eventDetail.aboutEvent')}</h2>
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {event.description || t('eventDetail.noDescriptionAvailable')}
                </p>
              </div>

              {event.categorie && (
                <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                  {t('eventDetail.category')} #{event.categorie.name}
                </span>
              )}
            </div>
          </div>

          {/* Description - Ordre 3 en mobile uniquement */}
          <div className="order-3 lg:hidden rounded-2xl p-6 border border-gray-100 shadow-md bg-white">
            <h2 className="text-2xl font-semibold mb-4">{t('eventDetail.aboutEvent')}</h2>
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {event.description || t('eventDetail.noDescriptionAvailable')}
              </p>
            </div>

            {event.categorie && (
              <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                {t('eventDetail.category')} #{event.categorie.name}
              </span>
            )}
          </div>

          {/* Photos - Ordre 4 en mobile uniquement */}
          <div className="order-4 lg:hidden">
            {event.images && event.images.length > 0 ? (
              <ImageCarousel images={event.images} />
            ) : (
              <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                <p className="text-gray-400">{t('eventDetail.noImagesAvailable')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Map en pleine largeur */}
        <div className="hidden lg:block rounded-2xl p-6 border border-gray-100 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{t('eventDetail.location')}</h2>
          <MapSection address={event.localisation.address} />
        </div>
      </div>
    </section>
  );
}