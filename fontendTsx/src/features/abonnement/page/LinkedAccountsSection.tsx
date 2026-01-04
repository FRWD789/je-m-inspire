// fontendTsx/src/features/abonnement/page/LinkedAccountsSection.tsx
import { useState, useEffect } from 'react';
import { CreditCard, Unlink, LinkIcon, Facebook } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { publicApi, privateApi } from '@/api/api';
import toast from 'react-hot-toast';

interface LinkedAccount {
  linked: boolean;
  account_id?: string;
  email?: string;
  page_name?: string;
  page_id?: string;
}

interface LinkedAccountsData {
  stripe: LinkedAccount;
  paypal: LinkedAccount;
  facebook: LinkedAccount;
}

export default function LinkedAccountsSection() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<LinkedAccountsData>({
    stripe: { linked: false },
    paypal: { linked: false },
    facebook: { linked: false }
  });
  const [loading, setLoading] = useState(true);
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await privateApi.get('/profile/linked-accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      toast.error(t('linkedAccounts.linkingError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialConnections = async () => {
    try {
      const response = await privateApi.get('/social/connections');
      const facebookConnection = response.data.connections?.find(
        (c: any) => c.platform === 'facebook' && c.is_active
      );
      
      return {
        facebook: {
          linked: !!facebookConnection,
          page_name: facebookConnection?.metadata?.page_name,
          page_id: facebookConnection?.platform_page_id
        }
      };
    } catch (error) {
      console.error('Error fetching social connections:', error);
      return { facebook: { linked: false } };
    }
  };

  const handleLink = async (provider: 'stripe' | 'paypal' | 'facebook') => {
    setLinkingProvider(provider);
    
    try {
      let endpoint = '';
      
      if (provider === 'facebook') {
        endpoint = '/social/facebook/link';
      } else {
        endpoint = `/profile/${provider}/link`;
      }
      
      const response = await privateApi.get(endpoint);
      
      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else if (response.data.already_linked) {
        toast.success(t('linkedAccounts.accountLinked'));
        fetchLinkedAccounts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('linkedAccounts.linkingError'));
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleUnlink = async (provider: 'stripe' | 'paypal' | 'facebook') => {
    const providerNames: Record<string, string> = {
      stripe: 'Stripe',
      paypal: 'PayPal',
      facebook: 'Facebook'
    };
    
    if (!window.confirm(`${t('linkedAccounts.unlinkConfirm')} ${providerNames[provider]} ?`)) {
      return;
    }

    setLinkingProvider(provider);
    
    try {
      let endpoint = '';
      
      if (provider === 'facebook') {
        const pageId = accounts.facebook.page_id;
        endpoint = `/social/connections/facebook${pageId ? `?page_id=${pageId}` : ''}`;
      } else {
        endpoint = `/profile/${provider}/unlink`;
      }
      
      const response = await privateApi.delete(endpoint);
      
      if (response.data.success) {
        toast.success(t('linkedAccounts.accountUnlinkedSuccess', { provider: providerNames[provider] }));
        
        // Refresh accounts
        await fetchLinkedAccounts();
        
        // Re-fetch social connections for Facebook
        if (provider === 'facebook') {
          const socialData = await fetchSocialConnections();
          setAccounts(prev => ({
            ...prev,
            ...socialData
          }));
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('linkedAccounts.unlinkingError'));
    } finally {
      setLinkingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{t('linkedAccounts.title')}</h3>
      
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
              disabled={loading || linkingProvider === 'stripe'}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <Unlink size={18} />
              {linkingProvider === 'stripe' ? t('linkedAccounts.unlinking') : t('linkedAccounts.unlink')}
            </button>
          ) : (
            <button
              onClick={() => handleLink("stripe")}
              disabled={loading || linkingProvider === 'stripe'}
              className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <LinkIcon size={18} />
              {linkingProvider === 'stripe' ? t('linkedAccounts.linking') : t('linkedAccounts.linkStripe')}
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
              disabled={loading || linkingProvider === 'paypal'}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <Unlink size={18} />
              {linkingProvider === 'paypal' ? t('linkedAccounts.unlinking') : t('linkedAccounts.unlink')}
            </button>
          ) : (
            <button
              onClick={() => handleLink("paypal")}
              disabled={loading || linkingProvider === 'paypal'}
              className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <LinkIcon size={18} />
              {linkingProvider === 'paypal' ? t('linkedAccounts.linking') : t('linkedAccounts.linkPayPal')}
            </button>
          )}
        </div>
      </div>

      {/* Facebook */}
      <div className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Facebook size={22} className="text-blue-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Facebook</h3>
              {accounts.facebook.linked ? (
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {accounts.facebook.page_name || t('linkedAccounts.accountLinked')}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">{t('linkedAccounts.noAccountLinked')}</p>
              )}
            </div>
          </div>
          {accounts.facebook.linked ? (
            <button
              onClick={() => handleUnlink("facebook")}
              disabled={loading || linkingProvider === 'facebook'}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <Unlink size={18} />
              {linkingProvider === 'facebook' ? t('linkedAccounts.unlinking') : t('linkedAccounts.unlink')}
            </button>
          ) : (
            <button
              onClick={() => handleLink("facebook")}
              disabled={loading || linkingProvider === 'facebook'}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition w-full sm:w-auto text-sm sm:text-base"
            >
              <Facebook size={18} />
              {linkingProvider === 'facebook' ? t('linkedAccounts.linking') : t('linkedAccounts.linkFacebook')}
            </button>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ {t('linkedAccounts.socialSyncInfo.title')}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('linkedAccounts.socialSyncInfo.step1')}</li>
          <li>• {t('linkedAccounts.socialSyncInfo.step2')}</li>
          <li>• {t('linkedAccounts.socialSyncInfo.step3')}</li>
          <li>• {t('linkedAccounts.socialSyncInfo.step4')}</li>
        </ul>
      </div>
    </div>
  );
}