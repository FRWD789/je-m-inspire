
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useApi } from '../../contexts/AuthContext';

const LinkAccountSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { get } = useApi();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        const finalizeLinking = async () => {
            try {
                // Déterminer le provider (Stripe ou PayPal)
                const isStripe = location.pathname.includes('stripe');
                const isPaypal = location.pathname.includes('paypal');
                
                setProvider(isStripe ? 'stripe' : 'paypal');

                if (isStripe) {
                    // Finaliser la liaison Stripe
                    const code = searchParams.get('code');
                    
                    if (!code) {
                        throw new Error('Code Stripe manquant');
                    }

                    const response = await get(`/api/profile/stripe/callback?code=${code}`);
                    
                    if (response.data.success) {
                        setSuccess(true);
                    } else {
                        throw new Error(response.data.message || 'Erreur lors de la liaison');
                    }
                } else if (isPaypal) {
                    // Finaliser la liaison PayPal
                    const code = searchParams.get('code');
                    
                    if (!code) {
                        throw new Error('Code PayPal manquant');
                    }

                    const response = await get(`/api/profile/paypal/callback?code=${code}`);
                    
                    if (response.data.success) {
                        setSuccess(true);
                    } else {
                        throw new Error(response.data.message || 'Erreur lors de la liaison');
                    }
                }
                
            } catch (err) {
                console.error('Erreur finalisation:', err);
                setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
            } finally {
                setLoading(false);
            }
        };

        finalizeLinking();
    }, [location, searchParams, get]);

    if (loading) {
        return (
            <div style={{
                maxWidth: '600px',
                margin: '50px auto',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '1px solid #dee2e6'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }} />
                <h2>Finalisation en cours...</h2>
                <p style={{ color: '#666' }}>
                    Veuillez patienter pendant que nous finalisons la liaison de votre compte.
                </p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                maxWidth: '600px',
                margin: '50px auto',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#fff3cd',
                borderRadius: '10px',
                border: '1px solid #ffc107'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
                <h1 style={{ color: '#856404', marginBottom: '20px' }}>
                    Erreur de liaison
                </h1>
                <p style={{ color: '#856404', marginBottom: '30px', fontSize: '16px' }}>
                    {error}
                </p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Retour au profil
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

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
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ color: '#155724', marginBottom: '20px' }}>
                Compte {provider === 'stripe' ? 'Stripe' : 'PayPal'} lié avec succès !
            </h1>
            <p style={{ color: '#155724', marginBottom: '30px', fontSize: '18px' }}>
                Votre compte de paiement a été configuré avec succès.
                Vous pouvez maintenant recevoir des paiements pour vos événements.
            </p>
            
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                textAlign: 'left'
            }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>Prochaines étapes :</h3>
                <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>✓ Créez et gérez vos événements</li>
                    <li>✓ Recevez des paiements directement sur votre compte</li>
                    <li>✓ Consultez vos statistiques de revenus</li>
                    <li>✓ Gérez vos remboursements si nécessaire</li>
                </ul>
            </div>

            <button
                onClick={() => navigate('/profile')}
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
                Retour au profil
            </button>
        </div>
    );
};

export default LinkAccountSuccess;