// fontendTsx/src/page/payment/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, Receipt, MapPin, Calendar } from 'lucide-react';
import { useApi } from '@/context/AuthContext';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

// Types
interface PaymentDetails {
  payment?: {
    paiement_id: number;
    status: string;
    total: number;
    provider: string;
  };
  operation?: {
    event?: {
      name: string;
      localisation?: {
        address: string;
      };
    };
  };
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { get } = useApi();
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<'stripe' | 'paypal' | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // 🔍 Détecter le provider selon les paramètres URL
        const sessionId = searchParams.get('session_id'); // Stripe
        const paymentId = searchParams.get('payment_id'); // PayPal
        const payerID = searchParams.get('PayerID'); // PayPal

        // Déterminer le provider
        if (sessionId) {
          setProvider('stripe');
        } else if (paymentId && payerID) {
          setProvider('paypal');
        }

        // Construire les paramètres de requête
        if (!sessionId && !paymentId) {
          throw new Error('Aucun identifiant de paiement trouvé');
        }

        const params = new URLSearchParams();
        if (sessionId) params.append('session_id', sessionId);
        if (paymentId) params.append('payment_id', paymentId);

        // 📡 Appel API pour vérifier le paiement
        const response = await get(`/api/payment/status?${params.toString()}`);
        
        console.log('✅ Réponse API:', response.data);
        setPaymentDetails(response.data);

        // Vérifier si le paiement est bien confirmé
        if (response.data.payment?.status !== 'paid') {
          setError('Le paiement n\'a pas été confirmé. Veuillez contacter le support.');
        }

      } catch (err: any) {
        console.error('❌ Erreur vérification paiement:', err);
        setError(err.response?.data?.error || 'Erreur lors de la vérification du paiement');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, get]);

  // 🔄 État de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="inline-block animate-spin">
            <Loader2 className="w-16 h-16 text-accent" />
          </div>
          <p className="mt-4 text-lg text-primary">Vérification du paiement en cours...</p>
          <p className="text-sm text-secondary">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  // ❌ État d'erreur
  if (error || paymentDetails?.payment?.status !== 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full animate-slide-up">
          <Card className="flex-col text-center p-8">
            <div className="inline-block animate-scale-in mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <h2 className="text-primary mb-4">Erreur de paiement</h2>
            
            <p className="text-secondary mb-6">
              {error || 'Le paiement n\'a pas pu être confirmé. Veuillez réessayer ou contacter le support.'}
            </p>

            <Button
              onClick={() => navigate('/')}
              variant="primary"
              className="w-auto mx-auto"
            >
              <Home size={20} className="mr-2" />
              Retour à l'accueil
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ État de succès
  const payment = paymentDetails?.payment;
  const event = paymentDetails?.operation?.event;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-6 animate-slide-up">
        
        {/* Header Card avec succès */}
        <Card className="flex-col text-center p-8 bg-gradient-to-r from-accent/10 to-accent/5">
          <div className="inline-block animate-scale-in mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-accent/20">
              <CheckCircle className="w-16 h-16 text-accent" />
            </div>
          </div>

          <h1 className="text-primary mb-2">Paiement réussi !</h1>
          <p className="text-secondary text-lg">Merci pour votre achat</p>
        </Card>

        {/* Message de confirmation */}
        <Card className="flex-col p-6 animate-fade-in-delay">
          <p className="text-primary text-center">
            Votre réservation a été confirmée. Vous recevrez un email de confirmation sous peu.
          </p>
        </Card>

        {/* Détails de la transaction */}
        {payment && (
          <Card className="flex-col p-6 animate-fade-in-delay">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Receipt className="w-5 h-5" />
              <h3 className="text-primary">Détails de la transaction</h3>
            </div>

            <div className="space-y-4">
              {/* Événement */}
              {event?.name && (
                <div className="flex items-start gap-3 pb-3 border-b border-primary/10">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-secondary">Événement</p>
                    <p className="font-medium text-primary">{event.name}</p>
                  </div>
                </div>
              )}

              {/* Lieu */}
              {event?.localisation?.address && (
                <div className="flex items-start gap-3 pb-3 border-b border-primary/10">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-secondary">Lieu</p>
                    <p className="font-medium text-primary text-sm">
                      {event.localisation.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Montant */}
              <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                <span className="text-secondary">Montant payé</span>
                <span className="font-bold text-accent text-xl">
                  {payment.total}€
                </span>
              </div>

              {/* Moyen de paiement */}
              <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                <span className="text-secondary">Moyen de paiement</span>
                <span className="font-medium text-primary capitalize">
                  {provider === 'stripe' ? '💳 Stripe' : '🅿️ PayPal'}
                </span>
              </div>

              {/* N° de transaction */}
              <div className="flex justify-between items-center">
                <span className="text-secondary">N° de transaction</span>
                <span className="font-mono text-sm text-primary">
                  {payment.paiement_id}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Retour à l'accueil
          </Button>

          <Button
            onClick={() => navigate('/dashboard/profile-settings')}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Receipt size={20} />
            Voir mes achats
          </Button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8) rotate(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 0.6s ease-out 0.2s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fadeIn 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}