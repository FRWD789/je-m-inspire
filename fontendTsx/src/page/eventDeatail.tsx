import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import usePrivateApi from '@/hooks/usePrivateApi';
import { PayementService } from '@/service/PaymentService';
import { Calendar, MapPin, ArrowLeft, DollarSignIcon, CreditCard, Plus, Minus } from 'lucide-react';
import type { User } from '@/types/user';
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
  const eventDate = useMemo(() => 
    new Date(event.start_date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }), [event.start_date]
  );

  return (
    <div className="relative h-[40vh] w-full overflow-hidden rounded-t-[12px]">
      <img
        src={event.thumbnail || "/assets/img/bg-hero.avif"}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/15 flex flex-col justify-end p-8 text-white">
        <button
          onClick={() => navigate("/events")}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition backdrop-blur-sm"
          aria-label="Retour aux événements"
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
            {event.localisation.address || "Adresse à venir"}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrganizerInfo = ({ creator }: { creator?:User }) => (
  <Link to={`/user/${creator?.id}`}>
  

  <div className="flex items-center gap-3">
    <div    className="w-10 h-10 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden">
      {creator?.profile.profile_picture ? (
        <img 
          src={`${creator?.profile.profile_picture}`} 
          alt={`Photo de ${creator.profile}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold">
          {creator?.profile.name?.[0]?.toUpperCase() || 'T'}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm text-gray-600">Organisé par</p>
      <p className="font-semibold text-gray-800">{creator?.profile.name || "Organisateur anonyme"}</p>
    </div>
  </div>
    </Link>
);

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
  const total =  event.base_price;

  const handleReserveClick = useCallback(() => {
    if (!user) {
      alert("Vous devez être connecté pour réserver un événement.");
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    setExpanded(true);
  }, [user, navigate, location, setExpanded]);

 

  
  return (
    <aside className={`transition-all duration-300 h-fit rounded-2xl p-6 border border-gray-100 shadow-md flex flex-col gap-4 ${expanded ? "flex-1" : "w-64"}`}>
      <h3 className="text-xl font-semibold">Réserver votre place</h3>
      <div className="flex items-center gap-2">
        <DollarSignIcon size={18} />
        <span className="text-lg font-medium">{event.base_price} €</span>
      </div>

      {!expanded && (
        <button
          className="w-full py-3 bg-accent text-white rounded-[8px] hover:bg-primary transition font-medium"
          onClick={handleReserveClick}
        >
          Réserver maintenant
        </button>
      )}

      {expanded && user && (
        <div className="space-y-5">

          {/* Total */}
          <div className="flex items-center justify-between text-xl font-bold text-indigo-600">
            <span>Total</span>
            <span>{total} €</span>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <h4 className="text-gray-700 font-semibold">Méthode de paiement</h4>
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

          {/* Checkout Button */}
          <button
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCheckout}
            disabled={!method}
          >
            <CreditCard className="w-5 h-5" />
            Procéder au paiement
          </button>
        </div>
      )}

      {!user && expanded && (
        <p className="text-red-600 mt-2 text-sm text-center">
          Vous devez être connecté pour réserver cet événement.
        </p>
      )}
    </aside>
  );
};

interface MapSectionProps {
  address?: string;
}

const MapSection: React.FC<MapSectionProps> = ({ address }) => {
  const mapSrc = useMemo(() => 
    address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : '',
    [address]
  );

  if (!address) {
    return <p className="text-gray-500 italic">Adresse non disponible</p>;
  }

  return (
    <div className="mt-4 w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <iframe
        title="Event Location"
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
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {event, fetchEventById, loading } = useEvent();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [method, setMethod] = useState<'stripe' | 'paypal'>('stripe');
  const api = usePrivateApi();
  
  const paymentService = useMemo(() => PayementService(api), [api]);

  // Add debug logging
  console.log('🔍 EventDetail rendered:', { id, loading, event: event?.id, user: user?.id });
  console.log(event)
  useEffect(() => {
    console.log('🔄 useEffect triggered, id:', id);
    if (id) {
      console.log('📞 Calling fetchEventById...');
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
      alert('Impossible de créer la session de paiement. Veuillez réessayer.');
    }
  }, [user, event?.id, method, paymentService, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-accent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <span className="ml-3">Chargement de l'événement...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-accent">
        <h1 className="text-2xl font-semibold mb-4">Événement introuvable</h1>
        <button 
          onClick={() => navigate("/events")} 
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-primary transition"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white/40 backdrop-blur-3xl min-h-screen">
      <HeroSection event={event} navigate={navigate} />
      <div className="px-[42px] py-[24px] flex gap-8 flex-col lg:flex-row">
        <div className="space-y-6 flex-1">
          <OrganizerInfo creator={event.creator} />
          <div>
            <h2 className="text-2xl font-semibold mb-3">À propos de l'événement</h2>
            <div className='max-h-[20vh] overflow-y-auto pr-2'>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description || "Aucune description disponible."}
              </p>
            </div>
          </div>
          {event.categorie && (
            <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
              Catégorie #{event.categorie.name}
            </span>
          )}
          <MapSection address={event.localisation.address} />
        </div>
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
      </div>
    </section>
  );
}