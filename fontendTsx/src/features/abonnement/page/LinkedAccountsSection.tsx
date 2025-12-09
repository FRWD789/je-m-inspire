import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Link as LinkIcon, Unlink, CreditCard, Lock, XCircle, CheckCircle } from "lucide-react";
import { privateApi } from "@/api/api";
import Abonnement from "@/features/abonnement/page/Abonnement";
import { useTranslation } from 'react-i18next';

function LinkedAccountsSection() {
  const [subscription, setSubscription] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [openSubSection, setOpenSubSection] = useState(false);
  const { t } = useTranslation();

  const fetchSubscription = async () => {
    try {
      const data = await privateApi.get("/abonnement/info");
      setSubscription(data.data);
      if (data.data.has_pro_plus) fetchLinkedAccounts();
    } catch (err) {
      console.error("Erreur abonnement:", err);
    }
  };

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
      setMessage(t('linkedAccounts.linkingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (provider: "stripe" | "paypal") => {
    setLoading(true);
    setMessage(null);
    try {
      await privateApi.delete(`/profile/${provider}/unlink`);
      setMessage(t('linkedAccounts.accountUnlinkedSuccess', { provider: provider.charAt(0).toUpperCase() + provider.slice(1) }));
      fetchLinkedAccounts();
    } catch (err) {
      console.error(err);
      setMessage(t('linkedAccounts.unlinkingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(t('linkedAccounts.cancelConfirmation'));

    if (!confirmed) return;

    setCancelLoading(true);
    setMessage(null);
    
    try {
      const data = await privateApi.post("/abonnement/cancel");
      setMessage(data.data.message || t('linkedAccounts.subscriptionCancelledSuccess'));
      
      await fetchSubscription();
      setAccounts(null);
      
    } catch (err: any) {
      console.error("Erreur annulation:", err);
      setMessage(
        err.response?.data?.message || 
        t('linkedAccounts.cancellationError')
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (!subscription)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        {t('linkedAccounts.loadingInfo')}
      </div>
    );

  if (!subscription.has_pro_plus) {
    return (
      <div className="p-4 sm:p-6 border rounded-lg bg-gray-50 text-center shadow-sm">
        <Lock size={32} className="mx-auto mb-3 text-gray-500" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">{t('linkedAccounts.featureReserved')}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {t('linkedAccounts.featureReservedDesc')}
        </p>
        <button
          onClick={() => setOpenSubSection(true)}
          className="inline-block bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition cursor-pointer text-sm sm:text-base"
        >
          {t('linkedAccounts.upgradeToProPlus')}
        </button>
        {openSubSection && (
          <div className="fixed z-999 w-full inset-0 min-h-screen bg-black/5 backdrop-blur-3xl overflow-y-auto">
            <Abonnement handelClose={() => setOpenSubSection(false)} />
          </div>
        )}
      </div>
    );
  }

  if (!accounts) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        {t('linkedAccounts.loadingLinkedAccounts')}
      </div>
    );
  }

  const isCancelPending = subscription.details?.cancel_at_period_end === true;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stripe */}
      <div className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CreditCard size={22} className="text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Stripe</h3>
              {accounts.stripe.linked ? (
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {accounts.stripe.account_id ? `ID: ${accounts.stripe.account_id}` : t('linkedAccounts.accountLinked')}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">{t('linkedAccounts.noAccountLinked')}</p>
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
              {t('linkedAccounts.unlink')}
            </button>
          ) : (
            <button
              onClick={() => handleLink("stripe")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <LinkIcon size={18} />
              {t('linkedAccounts.linkStripe')}
            </button>
          )}
        </div>
      </div>

      {/* PayPal */}
      <div className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CreditCard size={22} className="text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">PayPal</h3>
              {accounts.paypal.linked ? (
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {accounts.paypal.email || t('linkedAccounts.accountLinked')}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">{t('linkedAccounts.noAccountLinked')}</p>
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
              {t('linkedAccounts.unlink')}
            </button>
          ) : (
            <button
              onClick={() => handleLink("paypal")}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <LinkIcon size={18} />
              {t('linkedAccounts.linkPayPal')}
            </button>
          )}
        </div>
      </div>

      {isCancelPending ? (
        <div className="p-3 sm:p-4 border border-orange-200 rounded-lg bg-orange-50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <CheckCircle size={22} className="text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1 text-sm sm:text-base">
                {t('linkedAccounts.scheduledCancellation')}
              </h3>
              <p className="text-xs sm:text-sm text-orange-700 mb-2">
                {t('linkedAccounts.scheduledCancellationDesc')}
              </p>
              {subscription.end_date && (
                <p className="text-xs sm:text-sm text-orange-600">
                  {t('linkedAccounts.endDate')} : {new Date(subscription.end_date).toLocaleDateString('fr-CA')}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1 text-sm sm:text-base">
                {t('linkedAccounts.activeProPlusSubscription')}
              </h3>
              <p className="text-xs sm:text-sm text-red-700">
                {t('linkedAccounts.canCancelAnytime')}
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
                  <span className="hidden xs:inline">{t('linkedAccounts.cancelling')}</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span className="hidden xs:inline">{t('linkedAccounts.cancelSubscription')}</span>
                  <span className="xs:hidden">{t('linkedAccounts.cancel')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <Loader2 className="animate-spin mr-2" size={16} />
          {t('linkedAccounts.processing')}
        </div>
      )}
      {message && (
        <p className={`text-xs sm:text-sm ${message.includes('Erreur') || message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default LinkedAccountsSection;