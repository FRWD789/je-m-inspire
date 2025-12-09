import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const data = await privateApi.get("/abonnement/info");
      
      if (data.data) {
        setSubInfo(data.data);
      } else {
        throw new Error(t('subscription.subscriptionDataUnavailable'));
      }
    } catch (err) {
      console.error("Erreur abonnement:", err);
      setMessage({
        type: "error",
        text: t('subscription.cannotLoadInfo')
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
      t('subscription.initializingSubscription'),
      t('subscription.preparingFeatures'),
      t('subscription.configuringAccount'),
      t('subscription.almostDone')
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
          throw new Error(t('subscription.paymentLinkNotFound'));
        }
      }, 3500);

    } catch (err) {
      console.error(err);
      setShowPreparation(false);
      setMessage({
        type: "error",
        text: t('subscription.subscriptionCreationError')
      });
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm(t('subscription.cancelConfirmation'))) {
      return;
    }
    
    setActionLoading("cancel");
    setMessage(null);
    
    try {
      await privateApi.post("/abonnement/cancel");
      setMessage({
        type: "success",
        text: t('subscription.subscriptionWillCancel')
      });
      await fetchSubscriptionInfo();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: t('subscription.cancellationError')
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
          <span className="text-lg">{t('subscription.loading')}</span>
        </div>
      </div>
    );
  }

  // Preparation Animation Overlay
  if (showPreparation) {
    const steps = [
      t('subscription.initializingSubscription'),
      t('subscription.preparingFeatures'),
      t('subscription.configuringAccount'),
      t('subscription.almostDone'),
      t('subscription.redirectingToPayment')
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
            {t('subscription.preparingFeatures')}
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
        <h1 className="text-3xl font-bold text-gray-900">{t('subscription.titleMyPro')}</h1>
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
              <h2 className="text-2xl font-bold text-gray-900">{t('subscription.activeTitle')}</h2>
              <p className="text-gray-600">{t('subscription.activeSubtitle')}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t('subscription.subscriptionType')}</p>
              <p className="text-lg font-semibold text-gray-900">{subInfo.subscription_type || "Pro Plus"}</p>
            </div>
            
            {subInfo.end_date && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{t('subscription.renewalDate')}</p>
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
              {t('subscription.cancelSubscription')}
            </button>
          </div>
        </div>

        {/* Avantages actuels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('subscription.benefitsTitle')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
              <h4 className="font-semibold text-gray-900">{t('subscription.directPayments')}</h4>
              <p className="text-sm text-gray-600">{t('subscription.directPaymentsDesc')}</p>              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
              <h4 className="font-semibold text-gray-900">{t('subscription.reducedCommission')}</h4>
              <p className="text-sm text-gray-600">{t('subscription.reducedCommissionDesc')}</p>
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
          <span>{t('subscription.proOfferBadge')}</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          {t('subscription.maximizeYourEarnings')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('subscription.proOfferText1')} <span className="font-bold text-blue-600">{t('subscription.proOfferText2')}</span> {t('subscription.proOfferText3')}
           <span className="font-bold text-blue-600">{t('subscription.proOfferText4')}</span>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('subscription.freeAccountTitle')}</h3>
            <p className="text-gray-600">{t('subscription.currentPlan')}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
              <Clock className="text-red-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('subscription.indirectPayments')}</h4>
                <p className="text-sm text-gray-600">{t('subscription.indirectPaymentsDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
              <TrendingUp className="text-red-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('subscription.standardCommission')}</h4>
                <p className="text-sm text-gray-600">{t('subscription.standardCommissionDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Ban className="text-gray-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('subscription.limitedFunctions')}</h4>
                <p className="text-sm text-gray-600">{t('subscription.restrictedAccess')}</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t">
            <div className="text-3xl font-bold text-gray-900 mb-1">0$</div>
            <p className="text-gray-600">/{t('subscription.month')}</p>
          </div>
        </div>

        {/* Plan Pro+ */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-300 p-8 relative shadow-xl transform scale-105">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            RECOMMANDÉ
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro+</h3>
            <p className="text-gray-600">{t('subscription.forSeriousPros')}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
              <Zap className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('subscription.directPayements')} ⚡</h4>
                <p className="text-sm text-gray-600">{t('directPayementsDesc1')}<span className="font-bold">{t('directPayementsDesc2')}</span>{t('directPayementsDesc3')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
              <DollarSign className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('subscription.reducedCommission')} 💰</h4>
                <p className="text-sm text-gray-600">{t('subscription.reducedCommissionDesc1')}<span className="font-bold">{t('subscription.reducedCommissionDesc2')}</span></p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
              <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('subcription.advancedTools')}</h4>
                <p className="text-sm text-gray-600">{t('subscription.advancedToolsDesc')}</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-blue-200 mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-1">14,99$</div>
            <p className="text-gray-600 mb-1">CAD /{t('subscription.month')}</p>
            <p className="text-sm text-gray-500">{t('subcription.cancelAnytime')}</p>
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
              {t('subscription.subStripe')}
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
              {t('subscription.subPaypal')}
            </button>
          </div>
        </div>
      </div>

      {/* Points clés avec icônes */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t('subscription.whyPro')}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4">
              <Zap className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('subscription.whyProDesc1Title')}</h3>
            <p className="text-gray-600">
            {t('subscription.whyProDesc1')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4">
              <DollarSign className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('subscription.whyProDesc2Title')}</h3>
            <p className="text-gray-600">
            {t('subscription.whyProDesc2')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mb-4">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('subscription.whyProDesc3Title')}</h3>
            <p className="text-gray-600">
            {t('subscription.whyProDesc3')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}