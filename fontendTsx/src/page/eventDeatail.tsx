// fontendTsx/src/page/eventDeatail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Calendar, MapPin, ArrowLeft, DollarSign, Users, Loader2 } from 'lucide-react';
import Button from '@/components/ui/button';
import { paymentService } from '@/service/paymentService'; // ✅ AJOUTÉ

export default function EventDetail() {
  const { id } = useParams();
  const { event, fetchEventById, loading } = useEvent();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // États pour le paiement
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (id) fetchEventById(id);
  }, [id]);

  // ✅ MIGRÉ : Utilise paymentService au lieu de useApi
  const handleStripePayment = async () => {
    if (!event) return;

    setPaymentLoading(true);
    try {
      const response = await paymentService.stripeCheckout(event.id);

      if (response.url) {
        window.location.href = response.url;
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

  // ✅ MIGRÉ : Utilise paymentService au lieu de useApi
  const handlePayPalPayment = async () => {
    if (!event) return;

    setPaymentLoading(true);
    try {
      const response = await paymentService.paypalCheckout(event.id);

      if (response.approval_url) {
        window.location.href = response.approval_url;
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

  const totalPrice = event ? parseFloat(event.base_price as string) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">Événement introuvable</p>
        <Button onClick={() => navigate('/events')}>Retour aux événements</Button>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={20} />
        <span>Retour</span>
      </button>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Colonne principale */}
        <main className="space-y-6">
          {/* Image de l'événement */}
          {event.images && event.images.length > 0 ? (
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-100">
              <img
                src={`http://localhost:8000/storage/${event.images[0].path}`}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
              <Calendar size={64} className="text-accent/50" />
            </div>
          )}

          {/* Titre et catégorie */}
          <div>
            {event.categorie && (
              <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-3">
                {event.categorie.name}
              </span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.name}</h1>
          </div>

          {/* Informations clés */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-[8px]">
              <Calendar className="text-accent" size={24} />
              <div>
                <p className="text-xs text-gray-600">Date de début</p>
                <p className="font-semibold text-gray-800">
                  {new Date(event.start_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-[8px]">
              <Calendar className="text-accent" size={24} />
              <div>
                <p className="text-xs text-gray-600">Date de fin</p>
                <p className="font-semibold text-gray-800">
                  {new Date(event.end_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-[8px]">
              <MapPin className="text-accent" size={24} />
              <div>
                <p className="text-xs text-gray-600">Lieu</p>
                <p className="font-semibold text-gray-800 text-sm">
                  {event.localisation?.address || 'Adresse non spécifiée'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-[8px]">
              <Users className="text-accent" size={24} />
              <div>
                <p className="text-xs text-gray-600">Places disponibles</p>
                <p className="font-semibold text-gray-800">
                  {event.available_places} / {event.max_places}
                </p>
              </div>
            </div>
          </div>

          {/* Créateur */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-[8px]">
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
        </main>

        {/* Sidebar - Réservation */}
        <aside className="lg:sticky lg:top-6 h-fit space-y-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-baseline gap-2">
            <DollarSign className="text-accent" size={32} />
            <span className="text-3xl font-bold text-gray-900">{event.base_price}€</span>
            <span className="text-gray-600">/ place</span>
          </div>

          {!showPayment ? (
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                setShowPayment(true);
              }}
              disabled={event.available_places <= 0}
              className="w-full"
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
