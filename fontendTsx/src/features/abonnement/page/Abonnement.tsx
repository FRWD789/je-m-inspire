import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, CreditCard, AlertCircle, Star, Zap, Shield, BarChart3, X } from "lucide-react";
import { privateApi } from "@/api/api";

interface SubscriptionInfo {
  has_pro_plus?: boolean;
  subscription_type?: string;
  end_date?: string;
  status?: string;
    handelClose?:()=>void
}

export default function Abonnement({handelClose}:SubscriptionInfo) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreparation, setShowPreparation] = useState(false);
  const [preparationStep, setPreparationStep] = useState(0);

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const data = await privateApi.get("/abonnement/info");
      
      if (data.data) {
        setSubInfo(data.data);
      } else {
        throw new Error("Données d'abonnement non disponibles");
      }
    } catch (err) {
      console.error("Erreur abonnement:", err);
      setMessage({
        type: "error",
        text: "Impossible de charger vos informations d'abonnement."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const startPreparationAnimation = () => {
    setShowPreparation(true);
    setPreparationStep(0);
    
    const steps = [
      "Initialisation de votre abonnement...",
      "Préparation des fonctionnalités premium...",
      "Configuration de votre compte...",
      "Presque terminé..."
    ];

    steps.forEach((_, index) => {
      setTimeout(() => {
        setPreparationStep(index + 1);
      }, (index + 1) * 800);
    });

    // Final redirection after animation
    setTimeout(() => {
      setShowPreparation(false);
    }, steps.length * 800 + 500);
  };

  const handleSubscribe = async (provider: "stripe" | "paypal") => {
    setActionLoading(`subscribe-${provider}`);
    setMessage(null);
    
    try {
      // Start preparation animation
      startPreparationAnimation();

      const data = await privateApi.post(`/abonnement/${provider}`);

      // Wait for animation to complete before redirecting
      setTimeout(() => {
        if (provider === "stripe" && data.data?.url) {
          window.location.href = data.data.url;
        } else if (provider === "paypal" && data.data?.approval_url) {
          window.location.href = data.data.approval_url;
        } else {
          throw new Error("Lien de paiement introuvable");
        }
      }, 3500);

    } catch (err) {
      console.error(err);
      setShowPreparation(false);
      setMessage({
        type: "error",
        text: "Erreur lors de la création de l'abonnement. Veuillez réessayer."
      });
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Voulez-vous vraiment annuler votre abonnement ? Cette action est irréversible.")) {
      return;
    }
    
    setActionLoading("cancel");
    setMessage(null);
    
    try {
      await privateApi.post("/abonnement/cancel");
      setMessage({
        type: "success",
        text: "Votre abonnement sera annulé à la fin de la période en cours."
      });
      await fetchSubscriptionInfo();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Erreur lors de l'annulation de l'abonnement. Veuillez réessayer."
      });
    } finally {
      setActionLoading(null);
    }
  };

  const clearMessage = () => {
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span>Chargement de vos informations d'abonnement...</span>
        </div>
      </div>
    );
  }

  // Preparation Animation Overlay
  if (showPreparation) {
    const steps = [
      "Initialisation de votre abonnement...",
      "Préparation des fonctionnalités premium...",
      "Configuration de votre compte...",
      "Presque terminé...",
      "Redirection vers le paiement..."
    ];

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-3xl flex items-center justify-center z-9999 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="text-white" size={32} />
              </div>
             
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Préparation de votre abonnement Pro+
          </h3>
          
          <div className="space-y-3 mb-6">
            {steps.slice(0, preparationStep).map((step, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 text-green-600 animate-fade-in"
              >
                <CheckCircle size={16} className="flex-shrink-0" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
            
            {preparationStep < steps.length && (
              <div className="flex items-center gap-3 text-blue-600">
                <Loader2 size={16} className="animate-spin flex-shrink-0" />
                <span className="text-sm">{steps[preparationStep]}</span>
              </div>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(preparationStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl relative mx-auto p-6 space-y-6">
        <div className="top-8 absolute -right-10 cursor-pointer" onClick={handelClose}><X/></div>
      <h1 className="text-2xl font-bold text-gray-900">Mon Abonnement</h1>

      {/* Message d'alerte */}
      {message && (
        <div 
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">{message.text}</p>
          </div>
          <button 
            onClick={clearMessage}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Current Subscription Status */}
      <div className="p-6 border rounded-xl bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Statut actuel</h2>
        
        {subInfo?.has_pro_plus ? (
          <div className="flex items-center gap-2 text-green-600 mb-3">
            <CheckCircle size={20} />
            <span className="font-medium">Pro Plus actif</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <XCircle size={20} />
            <span className="font-medium">Compte gratuit</span>
          </div>
        )}

        <div className="space-y-2 text-gray-600">
          <p>
            Type :{" "}
            <span className="font-medium">
              {subInfo?.subscription_type || "Aucun abonnement actif"}
            </span>
          </p>

          {subInfo?.end_date && (
            <p>
              Expire le :{" "}
              <span className="font-medium">
                {new Date(subInfo.end_date).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          )}

          {subInfo?.status && (
            <p>
              Statut : <span className="font-medium capitalize">{subInfo.status}</span>
            </p>
          )}
        </div>

        {subInfo?.has_pro_plus && (
          <button
            onClick={handleCancel}
            disabled={actionLoading === "cancel"}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {actionLoading === "cancel" && <Loader2 className="animate-spin" size={16} />}
            Annuler mon abonnement
          </button>
        )}
      </div>

      {/* Pro+ Feature Card - Centered */}
      {!subInfo?.has_pro_plus && (
        <div className="flex justify-center">
          <div className="max-w-2xl w-full p-8 border rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Star size={16} />
                <span>PRO PLUS</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Passez à la vitesse supérieure
              </h2>
              <p className="text-gray-600 text-lg">
                Débloquez toutes les fonctionnalités premium
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Zap className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Liaison de comptes illimitée</h3>
                  <p className="text-sm text-gray-600">Connectez tous vos comptes de paiement</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <BarChart3 className="text-purple-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Analyses avancées</h3>
                  <p className="text-sm text-gray-600">Rapports détaillés et insights</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Shield className="text-green-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Sécurité renforcée</h3>
                  <p className="text-sm text-gray-600">Protection maximale de vos données</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Star className="text-yellow-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">Support prioritaire</h3>
                  <p className="text-sm text-gray-600">Réponses rapides et dédiées</p>
                </div>
              </div>
            </div>

            {/* Pricing and CTA */}
            <div className="text-center border-t pt-8">
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">14$</span>
                <span className="text-gray-600">/mois</span>
                <p className="text-sm text-gray-500 mt-1">Annulation à tout moment</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleSubscribe("stripe")}
                  disabled={!!actionLoading}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                  {actionLoading === "subscribe-stripe" ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <CreditCard size={20} />
                  )}
                  S'abonner avec Stripe
                </button>
                
                <button
                  onClick={() => handleSubscribe("paypal")}
                  disabled={!!actionLoading}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-xl hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                  {actionLoading === "subscribe-paypal" ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <CreditCard size={20} />
                  )}
                  S'abonner avec PayPal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading global pour les actions */}
      {actionLoading && !showPreparation && (
        <div className="flex items-center justify-center text-sm text-gray-600 p-4">
          <Loader2 className="animate-spin mr-2" size={16} />
          Traitement en cours...
        </div>
      )}
    </div>
  );
}