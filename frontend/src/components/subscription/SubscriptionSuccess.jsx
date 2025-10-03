import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';

const SubscriptionSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refetch } = useSubscription();
    const provider = searchParams.get('provider');

    useEffect(() => {
        // Rafraîchir les données d'abonnement
        refetch();
    }, []);

    return (
        <div style={{
            maxWidth: '600px',
            margin: '50px auto',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#d4edda',
            borderRadius: '10px',
            border: '1px solid #c3e6cb'
        }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                ✅
            </div>
            <h1 style={{ color: '#155724', marginBottom: '20px' }}>
                Abonnement activé avec succès !
            </h1>
            <p style={{ color: '#155724', marginBottom: '30px', fontSize: '18px' }}>
                Votre abonnement Pro Plus est maintenant actif.
                {provider === 'paypal' && ' Vous recevrez un email de confirmation de PayPal.'}
                {provider !== 'paypal' && ' Vous recevrez un email de confirmation de Stripe.'}
            </p>
            
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                textAlign: 'left'
            }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>Prochaines étapes :</h3>
                <ul style={{ color: '#666', lineHeight: '1.8' }}>
                    <li>✓ Accédez à toutes les fonctionnalités Pro Plus</li>
                    <li>✓ Créez des événements illimités</li>
                    <li>✓ Consultez vos statistiques avancées</li>
                    <li>✓ Bénéficiez du support prioritaire</li>
                </ul>
            </div>

            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '15px 40px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                Commencer à utiliser Pro Plus
            </button>
        </div>
    );
};

export default SubscriptionSuccess;