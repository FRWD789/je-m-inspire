import { useState, useEffect } from 'react';
import { useApi } from '../contexts/AuthContext';

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};
const debugGroup = (...args) => {
  if (DEBUG) console.group(...args);
};
const debugGroupEnd = () => {
  if (DEBUG) console.groupEnd();
};

export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { get, post } = useApi(); // S'assurer que post est bien importé

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            const response = await get('/api/abonnement/status');
            debug(response);
            setSubscription(response.data);
            setError(null);
        } catch (err) {
            debugError('Erreur chargement abonnement:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    const subscribe = async (provider) => {
        try {
            const endpoint = provider === 'stripe' 
                ? '/api/abonnement/stripe' 
                : '/api/abonnement/paypal';
            
            // CORRECTION : Utiliser POST au lieu de GET
            const response = await post(endpoint, {}); // Ajouter un objet vide comme body
            debug(response);
            if (response.data.success) {
                const url = provider === 'stripe' 
                    ? response.data.url 
                    : response.data.approval_url;
                
                if (url) {
                    window.location.href = url;
                } else {
                    throw new Error('URL de paiement non trouvée');
                }
            } else {
                throw new Error(response.data.message || 'Erreur lors de la souscription');
            }
        } catch (err) {
            debugError('Erreur souscription:', err);
            throw err;
        }
    };

    const cancelSubscription = async () => {
        try {
            // CORRECTION : Utiliser POST au lieu de GET
            const response = await post('/api/abonnement/cancel', {});
            
            if (response.data.success) {
                await fetchSubscription(); // Rafraîchir les données
            }
            return response.data;
        } catch (err) {
            debugError('Erreur annulation:', err);
            throw err;
        }
    };

    return {
        subscription,
        loading,
        error,
        hasProPlus: subscription?.has_pro_plus || false,
        hasActiveSubscription: subscription?.has_subscription || false,
        subscribe,
        cancelSubscription,
        refetch: fetchSubscription
    };
};