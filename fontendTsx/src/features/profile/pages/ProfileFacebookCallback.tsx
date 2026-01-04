// fontendTsx/src/features/profile/pages/ProfileFacebookCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { privateApi } from '@/api/api';

export default function ProfileFacebookCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // User cancelled OAuth
    if (error) {
      console.error('[Facebook Callback] OAuth error:', error, errorDescription);
      setStatus('error');
      setMessage(errorDescription || 'Autorisation refusée');
      toast.error('Liaison Facebook annulée');
      
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      return;
    }

    // Missing required params
    if (!code || !state) {
      console.error('[Facebook Callback] Missing code or state');
      setStatus('error');
      setMessage('Paramètres manquants');
      toast.error('Erreur lors de la liaison Facebook');
      
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      return;
    }

    // Process callback
    handleCallback(code, state);
  }, [searchParams, navigate]);

  const handleCallback = async (code: string, state: string) => {
    try {
      console.log('[Facebook Callback] Processing callback...');
      setMessage('Finalisation de la liaison...');

      const response = await privateApi.get(`/social/facebook/callback`, {
        params: { code, state }
      });

      console.log('[Facebook Callback] Response:', response.data);

      if (response.data.success) {
        setStatus('success');
        const pageName = response.data.connection?.page_name || 'Facebook';
        setMessage(`Compte ${pageName} lié avec succès !`);
        toast.success(`Compte Facebook lié avec succès !`);
        
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('[Facebook Callback] Error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Erreur lors de la liaison');
      toast.error('Erreur lors de la liaison Facebook');
      
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connexion à Facebook
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Succès !
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirection vers votre profil...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Retour au profil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}