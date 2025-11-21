import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { publicApi } from '@/api/api';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DisableNotificationsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const disableNotifications = async () => {
      try {
        const follower_id = searchParams.get('follower_id');
        const pro_id = searchParams.get('pro_id');
        const token = searchParams.get('token');

        if (!follower_id || !pro_id || !token) {
          setStatus('error');
          setMessage(t('following.invalidLink'));
          return;
        }

        await publicApi.post('/follow/notifications/disable', {
          follower_id,
          pro_id,
          token
        });

        setStatus('success');
        setMessage(t('following.notificationsDisabledSuccess'));
      } catch (error) {
        console.error('Error disabling notifications:', error);
        setStatus('error');
        setMessage(t('following.notificationDisableError'));
      }
    };

    disableNotifications();
  }, [searchParams, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('following.notificationsDisabled')}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {t('common.returnHome')}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('common.error')}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
            >
              {t('common.returnHome')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}