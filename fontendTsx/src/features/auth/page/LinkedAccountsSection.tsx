import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Link as LinkIcon, Unlink, CreditCard, Lock, XCircle, CheckCircle } from "lucide-react";
import { privateApi } from "@/api/api";
import Abonnement from "@/features/abonnement/page/Abonnement";

function LinkedAccountsSection() {
  const [subscription, setSubscription] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [openSubSection, setOpenSubSection] = useState(false);

  // ✅ 1. Fetch abonnement info first
  const fetchSubscription = async () => {
    try {
      const data = await privateApi.get("/abonnement/info");
      setSubscription(data.data);
      if (data.data.has_pro_plus) fetchLinkedAccounts();
    } catch (err) {
      console.error("Erreur abonnement:", err);
    }
  };

  // ✅ 2. Fetch linked accounts if user has Pro Plus
  const fetchLinkedAccounts = async () => {
    try {
      const data = await privateApi.get("/profile/linked-accounts");
      setAccounts(data.data);
    } catch (err) {
      console.error("Erreur comptes liés:", err);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleLink = async (provider: "stripe" | "paypal") => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await privateApi.get(`/profile/${provider}/link`);
      window.location.href = data.data.url;
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la liaison du compte.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (provider: "stripe" | "paypal") => {
    setLoading(true);
    setMessage(null);
    try {
      await privateApi.delete(`/profile/${provider}/unlink`);
      setMessage(`Compte ${provider} délié avec succès.`);
      fetchLinkedAccounts();
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la déliaison du compte.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. Handle subscription cancellation
  const handleCancelSubscription = async () => {
    // Confirmation avant annulation
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir annuler votre abonnement Pro Plus ?\n\n" +
      "Vous perdrez l'accès aux fonctionnalités suivantes :\n" +
      "• Liaison de comptes Stripe et PayPal\n" +
      "• Réception directe des paiements\n" +
      "Vos comptes liés seront automatiquement dissociés."
    );

    if (!confirmed) return;

    setCancelLoading(true);
    setMessage(null);
    
    try {
      const data = await privateApi.post("/abonnement/cancel");
      setMessage(data.data.message || "Abonnement annulé avec succès.");
      
      // Rafraîchir les données
      await fetchSubscription();
      setAccounts(null);
      
    } catch (err: any) {
      console.error("Erreur annulation:", err);
      setMessage(
        err.response?.data?.message || 
        "Erreur lors de l'annulation de l'abonnement."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // 🕒 Loading
  if (!subscription)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        Chargement des informations...
      </div>
    );

  // 🔒 User does NOT have Pro Plus
  if (!subscription.has_pro_plus) {
    return (
      <div className="p-4 sm:p-6 border rounded-lg bg-gray-50 text-center shadow-sm">
        <Lock size={32} className="mx-auto mb-3 text-gray-500" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">Fonctionnalité réservée</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Le lien vers Stripe et PayPal est réservé aux utilisateurs avec l'abonnement <strong>Pro Plus</strong>.
        </p>
        <button
          onClick={() => setOpenSubSection(true)}
          className="inline-block bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition cursor-pointer text-sm sm:text-base"
        >
          Passer à Pro Plus
        </button>
        {openSubSection && (
          <div className="fixed z-999 w-full inset-0 min-h-screen bg-black/5 backdrop-blur-3xl overflow-y-auto">
            <Abonnement handelClose={() => setOpenSubSection(false)} />
          </div>
        )}
      </div>
    );
  }

  // ✅ User has Pro Plus → show linking section
  if (!accounts) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        Chargement des comptes liés...
      </div>
    );
  }

  // ✅ AJOUT : Vérifier si l'abonnement est marqué pour annulation
  const isCancelPending = subscription.details?.cancel_at_period_end === true;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stripe - Responsive */}
      <div className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CreditCard size={22} className="text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Stripe</h3>
              {accounts.stripe.linked ? (
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {accounts.stripe.account_id ? `ID: ${accounts.stripe.account_id}` : "Compte lié"}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">Aucun compte lié</p>
              )}
            </div>
          </div>
          {accounts.stripe.linked ? (
            <button
              onClick={() => handleUnlink("stripe")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <Unlink size={18} />
              Délier
            </button>
          ) : (
            <button
              onClick={() => handleLink("stripe")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <LinkIcon size={18} />
              Lier Stripe
            </button>
          )}
        </div>
      </div>

      {/* PayPal - Responsive */}
      <div className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CreditCard size={22} className="text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">PayPal</h3>
              {accounts.paypal.linked ? (
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {accounts.paypal.email || "Compte lié"}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">Aucun compte lié</p>
              )}
            </div>
          </div>
          {accounts.paypal.linked ? (
            <button
              onClick={() => handleUnlink("paypal")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <Unlink size={18} />
              Délier
            </button>
          ) : (
            <button
              onClick={() => handleLink("paypal")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <LinkIcon size={18} />
              Lier PayPal
            </button>
          )}
        </div>
      </div>

      {/* ✅ MODIFICATION : Affichage conditionnel selon cancel_at_period_end */}
      {isCancelPending ? (
        // Si l'abonnement est marqué pour annulation
        <div className="p-3 sm:p-4 border border-orange-200 rounded-lg bg-orange-50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <CheckCircle size={22} className="text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1 text-sm sm:text-base">
                Annulation programmée
              </h3>
              <p className="text-xs sm:text-sm text-orange-700 mb-2">
                Votre abonnement Pro Plus sera annulé à la fin de la période en cours.
              </p>
              {subscription.end_date && (
                <p className="text-xs sm:text-sm text-orange-600">
                  Date de fin : {new Date(subscription.end_date).toLocaleDateString('fr-CA')}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Si l'abonnement est actif et non marqué pour annulation
        <div className="p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1 text-sm sm:text-base">
                Abonnement Pro Plus actif
              </h3>
              <p className="text-xs sm:text-sm text-red-700">
                Vous pouvez annuler votre abonnement à tout moment. Les comptes liés seront dissociés automatiquement.
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto whitespace-nowrap text-sm sm:text-base"
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="hidden xs:inline">Annulation...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span className="hidden xs:inline">Annuler l'abonnement</span>
                  <span className="xs:hidden">Annuler</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status messages */}
      {loading && (
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <Loader2 className="animate-spin mr-2" size={16} />
          Traitement en cours...
        </div>
      )}
      {message && (
        <p className={`text-xs sm:text-sm ${message.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default LinkedAccountsSection;