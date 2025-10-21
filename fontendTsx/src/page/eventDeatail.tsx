import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/context/EventContext';
import { useAuth, useApi } from '@/context/AuthContext'; // ✅ MODIFIÉ : ajout de useApi
import { Calendar, MapPin, ArrowLeft, DollarSign, Users, Loader2 } from 'lucide-react';
import Button from '@/components/ui/button';

export default function EventDetail() {
  const { id } = useParams();
  const { event, fetchEventById, loading } = useEvent();
  const { user, isAuthenticated } = useAuth(); // ✅ MODIFIÉ : isAuthenticated au lieu de accessToken
  const { post } = useApi(); // ✅ AJOUTÉ
  const navigate = useNavigate();

  // États pour le paiement
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (id) fetchEventById(id);
  }, [id]);

  const handleStripePayment = async () => {
    if (!event) return;

    setPaymentLoading(true);
    try {
      const response = await post('/api/stripe/checkout', { // ✅ MODIFIÉ : post au lieu de privateApi.post
        event_id: event.id
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert('Erreur lors de l\'initialisation du paiement Stripe');
      }
    } catch (error: any) {
      console.error('Erreur paiement Stripe:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du paiement Stripe');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    if (!event) return;

    setPaymentLoading(true);
    try {
      const response = await post('/api/paypal/checkout', { // ✅ MODIFIÉ : post au lieu de privateApi.post
        event_id: event.id
      });

      if (response.data.approval_url) {
        window.location.href = response.data.approval_url;
      } else {
        alert('Erreur lors de l\'initialisation du paiement PayPal');
      }
    } catch (error: any) {
      console.error('Erreur paiement PayPal:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du paiement PayPal');
    } finally {
      setPaymentLoading(false);
    }
  };

  const totalPrice = event ? event.base_price.toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-accent">
        <Loader2 className="animate-spin w-8 h-8 mr-4" />
        <h1>Chargement de l'événement...</h1>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-accent">
        <h1>Événement introuvable.</h1>
        <button
          onClick={() => navigate("/events")}
          className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-primary transition"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white/40 backdrop-blur-3xl min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full drop-shadow-xl overflow-hidden rounded-t-[12px]">
        <img
          src={event.thumbnail || "/assets/img/bg-hero.avif"}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/15 flex flex-col justify-end p-8 text-white">
          <button
            onClick={() => navigate("/events")}
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-4xl md:text-5xl text-white font-bold mb-4">{event.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-200">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date(event.start_date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} /> {event.localisation?.address || "Adresse à venir"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-[42px] py-[24px] flex flex-col lg:flex-row gap-8">
        {/* Left: Description & Organizer */}
        <div className="space-y-6 flex-1">
          {/* Organizer */}
          <div className="flex items-center gap-3">
            {event.creator ? (
              <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden">
                {event.creator.profile_picture ? (
                  <img src={`http://localhost:8000/storage/${event.creator.profile_picture}`} alt="" />
                ) : (
                  event.creator.name[0].toUpperCase()
                )}
              </div>
            ) : (
              <div className="w-12 h-12 flex items-center bg-primary text-white justify-center rounded-full object-cover">
                T
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Organisé par</p>
              <p className="font-semibold text-gray-800">
                {event.creator?.name || "Organisateur anonyme"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-3">À propos de l'événement</h2>
            <div className="max-h-[30vh] overflow-y-auto pr-2">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description || "Aucune description disponible pour cet événement."}
              </p>
            </div>
          </div>

          {/* Category Tag */}
          {event.categorie && (
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                Catégorie #{event.categorie.name}
              </span>
            </div>
          )}
        </div>

        {/* Right: Reservation Card */}
        <aside className="lg:w-[400px] hover:bg-white transition rounded-2xl hover:shadow-md p-6 h-fit space-y-4 bg-white/90">
          <h3 className="text-xl font-semibold">Réserver votre place</h3>

          {/* Prix et disponibilité */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Prix</span>
              <div className="flex items-center gap-1 text-xl font-semibold text-accent">
                <DollarSign size={18} />
                {event.base_price} €
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Places disponibles</span>
              <div className="flex items-center gap-1 text-gray-800 font-medium">
                <Users size={16} />
                {event.available_places}/{event.max_places}
              </div>
            </div>
          </div>

          {/* Message si non connecté */}
          {!isAuthenticated && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-[8px] text-sm text-blue-700">
              ℹ️ Connectez-vous pour réserver votre place
            </div>
          )}

          {/* Bouton principal de réservation */}
          {!showPayment ? (
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: `/events/${id}` } });
                } else if (event.available_places <= 0) {
                  alert('Désolé, il n\'y a plus de places disponibles');
                } else {
                  setShowPayment(true);
                }
              }}
              disabled={event.available_places <= 0}
              className="w-full py-3 text-base font-semibold"
            >
              {event.available_places <= 0 ? 'Complet' : isAuthenticated ? 'Réserver maintenant' : 'Se connecter pour réserver'}
            </Button>
          ) : (
            <>
              {/* Section de paiement */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[8px]">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="text-xl font-bold text-accent">{totalPrice} €</span>
                </div>

                {/* Boutons de paiement */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">Choisissez votre méthode de paiement</p>

                  <Button
                    onClick={handleStripePayment}
                    disabled={paymentLoading || event.available_places <= 0}
                    className="w-full bg-[#635bff] hover:bg-[#5348e8] flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>💳 Payer avec Stripe</>
                    )}
                  </Button>

                  <Button
                    onClick={handlePayPalPayment}
                    disabled={paymentLoading || event.available_places <= 0}
                    className="w-full bg-[#ffc439] hover:bg-[#f0b329] text-gray-800 flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>🅿️ Payer avec PayPal</>
                    )}
                  </Button>

                  <button
                    onClick={() => setShowPayment(false)}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                  >
                    Annuler
                  </button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  🔒 Paiement sécurisé • Remboursement garanti
                </p>
              </div>
            </>
          )}

          {/* Map Preview */}
          {event.localisation?.lat && event.localisation?.lng && (
            <div className="h-48 mt-4 rounded-xl overflow-hidden bg-gray-100">
              <iframe
                src={`https://maps.google.com/maps?q=${event.localisation.lat},${event.localisation.lng}&z=14&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}