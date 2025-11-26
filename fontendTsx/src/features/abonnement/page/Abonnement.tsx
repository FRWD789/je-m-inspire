import { useEffect, useState } from "react";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  AlertCircle, 
  Star, 
  Zap, 
  TrendingUp,
  DollarSign,
  X,
  ArrowRight,
  Check,
  Clock,
  Ban
} from "lucide-react";
import { privateApi } from "@/api/api";

interface SubscriptionInfo {
  has_pro_plus?: boolean;
  subscription_type?: string;
  end_date?: string;
  status?: string;
  handelClose?: () => void;
}

export default function Abonnement({ handelClose }: SubscriptionInfo) {
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

    setTimeout(() => {
      setShowPreparation(false);
    }, steps.length * 800 + 500);
  };

  const handleSubscribe = async (provider: "stripe" | "paypal") => {
    setActionLoading(`subscribe-${provider}`);
    setMessage(null);
    
    try {
      startPreparationAnimation();

      const data = await privateApi.post(`/abonnement/${provider}`);

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
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin mr-2" size={32} />
          <span className="text-lg">Chargement...</span>
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
      <div className="fixed inset-0 bg-black/20 backdrop-blur-3xl flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
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
                <span className="text-sm text-left">{step}</span>
              </div>
            ))}
            
            {preparationStep < steps.length && (
              <div className="flex items-center gap-3 text-blue-600">
                <Loader2 size={16} className="animate-spin flex-shrink-0" />
                <span className="text-sm text-left">{steps[preparationStep]}</span>
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

  // Si l'utilisateur a déjà Pro Plus
  if (subInfo?.has_pro_plus) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Mon Abonnement Pro+</h1>
          {handelClose && (
            <button onClick={handelClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={24} className="text-gray-600" />
            </button>
          )}
        </div>

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
              className="text-gray-500 hover:text-gray-700 flex-shrink-0 text-xl"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                <Star className="text-white" size={32} fill="white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Abonnement Pro+ Actif</h2>
                <p className="text-gray-600">Vous profitez de tous les avantages premium</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Type d'abonnement</p>
              <p className="text-lg font-semibold text-gray-900">{subInfo.subscription_type || "Pro Plus"}</p>
            </div>
            
            {subInfo.end_date && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Renouvellement le</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(subInfo.end_date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCancel}
              disabled={actionLoading === "cancel"}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors font-medium"
            >
              {actionLoading === "cancel" && <Loader2 className="animate-spin" size={16} />}
              Annuler mon abonnement
            </button>
          </div>
        </div>

        {/* Avantages actuels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Vos avantages Pro+</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Paiements directs</h4>
                <p className="text-sm text-gray-600">Recevez vos revenus immédiatement</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Commission réduite</h4>
                <p className="text-sm text-gray-600">Gardez plus de vos revenus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page de présentation pour les non-abonnés
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center relative">
        {handelClose && (
          <button 
            onClick={handelClose} 
            className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        )}
        
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Star size={16} fill="white" />
          <span>OFFRE PRO+</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Maximisez vos revenus avec Pro+
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Recevez vos paiements <span className="font-bold text-blue-600">directement</span> et 
          payez <span className="font-bold text-blue-600">moins de commission</span>
        </p>
      </div>

      {/* Message d'erreur */}
      {message && (
        <div 
          className={`p-4 rounded-lg flex items-start gap-3 max-w-2xl mx-auto ${
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
            className="text-gray-500 hover:text-gray-700 flex-shrink-0 text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Comparaison Gratuit vs Pro+ */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Plan Gratuit */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Compte Gratuit</h3>
            <p className="text-gray-600">Votre plan actuel</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
              <Clock className="text-red-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Paiements indirects</h4>
                <p className="text-sm text-gray-600">Vous devez attendre que nous vous transférions vos revenus</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
              <TrendingUp className="text-red-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Commission standard</h4>
                <p className="text-sm text-gray-600">Taux de commission plus élevé sur chaque transaction</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Ban className="text-gray-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Fonctionnalités limitées</h4>
                <p className="text-sm text-gray-600">Accès restreint aux outils avancés</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t">
            <div className="text-3xl font-bold text-gray-900 mb-1">0$</div>
            <p className="text-gray-600">/mois</p>
          </div>
        </div>

        {/* Plan Pro+ */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-300 p-8 relative shadow-xl transform scale-105">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            RECOMMANDÉ
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro+</h3>
            <p className="text-gray-600">Pour les professionnels sérieux</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
              <Zap className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Paiements directs ⚡</h4>
                <p className="text-sm text-gray-600">Recevez vos revenus <span className="font-bold">instantanément</span> sur votre compte</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
              <DollarSign className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Commission réduite 💰</h4>
                <p className="text-sm text-gray-600">Taux préférentiel pour <span className="font-bold">maximiser vos revenus</span></p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
              <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Outils avancés</h4>
                <p className="text-sm text-gray-600">Analyses détaillées et fonctionnalités premium</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-blue-200 mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-1">14,99$</div>
            <p className="text-gray-600 mb-1">CAD /mois</p>
            <p className="text-sm text-gray-500">Annulation à tout moment</p>
          </div>

          {/* Boutons d'abonnement */}
          <div className="space-y-3">
            <button
              onClick={() => handleSubscribe("stripe")}
              disabled={!!actionLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0070ba] to-[#003087] text-white px-6 py-4 rounded-xl hover:from-[#003087] hover:to-[#001C64] disabled:opacity-50 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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

      {/* Points clés avec icônes */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Pourquoi passer à Pro+ ?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4">
              <Zap className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Revenus instantanés</h3>
            <p className="text-gray-600">
              Plus d'attente ! Vos revenus sont transférés directement sur votre compte Stripe ou PayPal dès la vente.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4">
              <DollarSign className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Plus de profits</h3>
            <p className="text-gray-600">
              Bénéficiez d'un taux de commission réduit et gardez une plus grande partie de vos revenus.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mb-4">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Croissance accélérée</h3>
            <p className="text-gray-600">
              Accédez à des outils d'analyse avancés pour optimiser vos événements et augmenter vos revenus.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action final */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Prêt à booster vos revenus ?
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          Rejoignez les professionnels qui ont déjà fait le choix de Pro+
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleSubscribe("stripe")}
            disabled={!!actionLoading}
            className="flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-all font-bold text-lg shadow-lg"
          >
            <ArrowRight size={20} />
            Passer à Pro+ maintenant
          </button>
        </div>
      </div>
    </div>
  );
}