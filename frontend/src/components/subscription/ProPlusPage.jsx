import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/AuthContext';

const ProPlusPage = () => {
    const navigate = useNavigate();
    const { user, isProfessional } = useAuth();
    const { subscription, loading, hasProPlus, subscribe, cancelSubscription, refetch } = useSubscription();
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Rediriger si non professionnel
    if (!loading && !isProfessional()) {
        return (
            <div style={{
                maxWidth: '800px',
                margin: '50px auto',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#fff3cd',
                borderRadius: '10px',
                border: '1px solid #ffc107'
            }}>
                <h2 style={{ color: '#856404' }}>Accès réservé aux professionnels</h2>
                <p>L'abonnement Pro Plus est uniquement disponible pour les comptes professionnels.</p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginTop: '20px',
                        padding: '12px 30px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Retour au tableau de bord
                </button>
            </div>
        );
    }

    const handleSubscribe = async (provider) => {
        if (hasProPlus) {
            alert('Vous avez déjà un abonnement Pro Plus actif');
            return;
        }

        setProcessing(true);
        setSelectedProvider(provider);

        try {
            await subscribe(provider);
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la souscription');
            setProcessing(false);
            setSelectedProvider(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement Pro Plus ? Cette action sera effective à la fin de la période en cours.')) {
            return;
        }

        setProcessing(true);
        try {
            const result = await cancelSubscription();
            alert(result.message || 'Votre abonnement sera annulé à la fin de la période en cours');
            refetch();
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de l\'annulation');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Chargement...
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            {/* En-tête */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px'
                }}>
                    Abonnement Pro Plus
                </h1>
                <p style={{
                    fontSize: '20px',
                    color: '#666',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Débloquez toutes les fonctionnalités premium pour propulser votre activité professionnelle
                </p>
            </div>

            {/* Statut actuel */}
            {hasProPlus && subscription?.subscription && (
                <div style={{
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: '#155724', marginBottom: '10px' }}>
                        ✅ Abonnement Pro Plus Actif
                    </h3>
                    <p style={{ color: '#155724', marginBottom: '15px' }}>
                        Votre abonnement est actif
                        {subscription.subscription.end_date && ` jusqu'au ${new Date(subscription.subscription.end_date).toLocaleDateString('fr-FR')}`}
                    </p>
                    {subscription.subscription.expiring_soon && (
                        <p style={{
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '15px'
                        }}>
                            ⚠️ Votre abonnement expire bientôt
                        </p>
                    )}
                    <button
                        onClick={handleCancelSubscription}
                        disabled={processing}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: processing ? '#6c757d' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: processing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {processing ? 'Traitement...' : 'Annuler l\'abonnement'}
                    </button>
                </div>
            )}

            {/* Fonctionnalités */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                marginBottom: '40px'
            }}>
                <h2 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    Fonctionnalités incluses
                </h2>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    {[
                        {
                            icon: '🎯',
                            title: 'Événements illimités',
                            description: 'Créez autant d\'événements que vous le souhaitez sans aucune limitation'
                        },
                        {
                            icon: '📊',
                            title: 'Statistiques avancées',
                            description: 'Accédez à des analyses détaillées de vos événements et de votre audience'
                        },
                        {
                            icon: '🎨',
                            title: 'Personnalisation',
                            description: 'Personnalisez vos pages d\'événements avec votre branding'
                        },
                        {
                            icon: '💬',
                            title: 'Support prioritaire',
                            description: 'Bénéficiez d\'un support client prioritaire et dédié'
                        },
                        {
                            icon: '📧',
                            title: 'Marketing par email',
                            description: 'Envoyez des campagnes email à vos participants directement depuis la plateforme'
                        },
                        {
                            icon: '🔔',
                            title: 'Notifications automatiques',
                            description: 'Système de notifications automatiques pour vos participants'
                        }
                    ].map((feature, index) => (
                        <div key={index} style={{
                            padding: '25px',
                            borderRadius: '15px',
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e9ecef',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                                {feature.icon}
                            </div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                color: '#333'
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tarification */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                marginBottom: '40px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#667eea',
                    marginBottom: '10px'
                }}>
                  14.99 CAD
                </div>
                <div style={{
                    fontSize: '20px',
                    color: '#666',
                    marginBottom: '30px'
                }}>
                    par mois, sans engagement
                </div>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    marginBottom: '30px',
                    textAlign: 'left',
                    maxWidth: '400px',
                    margin: '0 auto 30px'
                }}>
                    <li style={{ padding: '10px 0', color: '#666' }}>✓ Annulation à tout moment</li>
                    <li style={{ padding: '10px 0', color: '#666' }}>✓ Facturation mensuelle</li>
                    <li style={{ padding: '10px 0', color: '#666' }}>✓ Accès immédiat à toutes les fonctionnalités</li>
                    <li style={{ padding: '10px 0', color: '#666' }}>✓ Mises à jour gratuites</li>
                </ul>
            </div>

            {/* Boutons de paiement */}
            {!hasProPlus && (
                <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: '28px',
                        marginBottom: '30px',
                        color: '#333'
                    }}>
                        Choisissez votre méthode de paiement
                    </h2>
                    
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {/* Bouton Stripe */}
                        <button
                            onClick={() => handleSubscribe('stripe')}
                            disabled={processing}
                            style={{
                                padding: '20px 40px',
                                backgroundColor: processing && selectedProvider === 'stripe' ? '#6c757d' : '#635bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                minWidth: '250px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {processing && selectedProvider === 'stripe' ? (
                                'Redirection...'
                            ) : (
                                <>
                                    <span>💳</span>
                                    <span>S'abonner avec Stripe</span>
                                </>
                            )}
                        </button>

                        {/* Bouton PayPal */}
                        <button
                            onClick={() => handleSubscribe('paypal')}
                            disabled={processing}
                            style={{
                                padding: '20px 40px',
                                backgroundColor: processing && selectedProvider === 'paypal' ? '#6c757d' : '#0070ba',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                minWidth: '250px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {processing && selectedProvider === 'paypal' ? (
                                'Redirection...'
                            ) : (
                                <>
                                    <span>🅿️</span>
                                    <span>S'abonner avec PayPal</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p style={{
                        marginTop: '30px',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        🔒 Paiement sécurisé • Annulation à tout moment • Facturation automatique mensuelle
                    </p>
                </div>
            )}

            {/* Bouton retour */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 30px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Retour au tableau de bord
                </button>
            </div>
        </div>
    );
};

export default ProPlusPage;