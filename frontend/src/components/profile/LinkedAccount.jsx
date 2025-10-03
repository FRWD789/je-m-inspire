// components/profile/LinkedAccounts.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/AuthContext';

const LinkedAccounts = () => {
    const { get, post, delete: deleteApi } = useApi();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({ stripe: false, paypal: false });
    const [accounts, setAccounts] = useState({
        stripe: { linked: false, account_id: null },
        paypal: { linked: false, account_id: null, email: null }
    });

    useEffect(() => {
        fetchLinkedAccounts();
    }, []);

    const fetchLinkedAccounts = async () => {
        try {
            setLoading(true);
            const response = await get('/api/profile/linked-accounts');
            
            if (response.data.success) {
                setAccounts(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement comptes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkStripe = async () => {
        setProcessing({ ...processing, stripe: true });
        
        try {
            const response = await get('/api/profile/stripe/link');
            
            if (response.data.success && response.data.url) {
                // Redirection vers Stripe OAuth
                window.location.href = response.data.url;
            } else if (response.data.already_linked) {
                alert('Un compte Stripe est déjà lié à votre profil');
                fetchLinkedAccounts();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la liaison Stripe';
            
            if (error.response?.data?.already_linked) {
                alert('Un compte Stripe est déjà lié à votre profil');
                fetchLinkedAccounts();
            } else {
                alert(errorMessage);
            }
        } finally {
            setProcessing({ ...processing, stripe: false });
        }
    };

    const handleUnlinkStripe = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir délier votre compte Stripe ?')) {
            return;
        }

        setProcessing({ ...processing, stripe: true });
        
        try {
            const response = await deleteApi('/api/profile/stripe/unlink');
            
            if (response.data.success) {
                alert('Compte Stripe délié avec succès');
                fetchLinkedAccounts();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la déliaison');
        } finally {
            setProcessing({ ...processing, stripe: false });
        }
    };

    const handleLinkPaypal = async () => {
        setProcessing({ ...processing, paypal: true });
        
        try {
            const response = await get('/api/profile/paypal/link');
            
            if (response.data.success && response.data.url) {
                // Redirection vers PayPal OAuth
                window.location.href = response.data.url;
            } else if (response.data.already_linked) {
                alert('Un compte PayPal est déjà lié à votre profil');
                fetchLinkedAccounts();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la liaison PayPal';
            
            if (error.response?.data?.already_linked) {
                alert('Un compte PayPal est déjà lié à votre profil');
                fetchLinkedAccounts();
            } else {
                alert(errorMessage);
            }
        } finally {
            setProcessing({ ...processing, paypal: false });
        }
    };

    const handleUnlinkPaypal = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir délier votre compte PayPal ?')) {
            return;
        }

        setProcessing({ ...processing, paypal: true });
        
        try {
            const response = await deleteApi('/api/profile/paypal/unlink');
            
            if (response.data.success) {
                alert('Compte PayPal délié avec succès');
                fetchLinkedAccounts();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la déliaison');
        } finally {
            setProcessing({ ...processing, paypal: false });
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                Chargement...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ marginBottom: '30px' }}>Comptes de paiement liés</h2>
            
            {/* Stripe */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: '#635bff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '20px'
                        }}>
                            S
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>Stripe</h3>
                            {accounts.stripe.linked ? (
                                <>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        backgroundColor: '#d4edda',
                                        color: '#155724',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        marginBottom: '5px'
                                    }}>
                                        ✓ Connecté
                                    </span>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                                        ID: {accounts.stripe.account_id?.substring(0, 20)}...
                                    </p>
                                </>
                            ) : (
                                <span style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    ✗ Non connecté
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {accounts.stripe.linked ? (
                        <button
                            onClick={handleUnlinkStripe}
                            disabled={processing.stripe}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: processing.stripe ? '#ccc' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: processing.stripe ? 'not-allowed' : 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {processing.stripe ? 'Traitement...' : 'Délier le compte'}
                        </button>
                    ) : (
                        <button
                            onClick={handleLinkStripe}
                            disabled={processing.stripe}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: processing.stripe ? '#ccc' : '#635bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: processing.stripe ? 'not-allowed' : 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {processing.stripe ? 'Traitement...' : 'Connecter Stripe'}
                        </button>
                    )}
                </div>
            </div>

            {/* PayPal */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: '#0070ba',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '20px'
                        }}>
                            P
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>PayPal</h3>
                            {accounts.paypal.linked ? (
                                <>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        backgroundColor: '#d4edda',
                                        color: '#155724',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        marginBottom: '5px'
                                    }}>
                                        ✓ Connecté
                                    </span>
                                    {accounts.paypal.email && (
                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                                            Email: {accounts.paypal.email}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <span style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    ✗ Non connecté
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {accounts.paypal.linked ? (
                        <button
                            onClick={handleUnlinkPaypal}
                            disabled={processing.paypal}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: processing.paypal ? '#ccc' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: processing.paypal ? 'not-allowed' : 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {processing.paypal ? 'Traitement...' : 'Délier le compte'}
                        </button>
                    ) : (
                        <button
                            onClick={handleLinkPaypal}
                            disabled={processing.paypal}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: processing.paypal ? '#ccc' : '#0070ba',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: processing.paypal ? 'not-allowed' : 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {processing.paypal ? 'Traitement...' : 'Connecter PayPal'}
                        </button>
                    )}
                </div>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#e8f4f8',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#666'
            }}>
                <strong>ℹ️ Information :</strong> Liez vos comptes de paiement pour recevoir des paiements 
                directement de vos clients. Vous pouvez délier et relier vos comptes à tout moment.
            </div>
        </div>
    );
};

export default LinkedAccounts;