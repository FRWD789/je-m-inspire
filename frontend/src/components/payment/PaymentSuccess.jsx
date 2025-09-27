// components/payment/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../../contexts/AuthContext';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { get } = useApi();
    const [loading, setLoading] = useState(true);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const sessionId = searchParams.get('session_id');
                const paymentId = searchParams.get('paymentId');
                
                if (sessionId || paymentId) {
                    // Vérifier le paiement côté serveur
                    const response = await get(`/api/payment/status?session_id=${sessionId}&payment_id=${paymentId}`);
                    setPaymentDetails(response.data);
                }
            } catch (error) {
                console.error('Erreur vérification paiement:', error);
                setError('Erreur lors de la vérification du paiement');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    const handleGoToDashboard = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                    Vérification du paiement en cours...
                </div>
                <div>Veuillez patienter</div>
            </div>
        );
    }

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
            {error ? (
                <div>
                    <div style={{
                        fontSize: '48px',
                        color: '#dc3545',
                        marginBottom: '20px'
                    }}>
                        ❌
                    </div>
                    <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
                        Erreur de vérification
                    </h1>
                    <p style={{ color: '#666', marginBottom: '30px' }}>
                        {error}
                    </p>
                </div>
            ) : (
                <div>
                    <div style={{
                        fontSize: '48px',
                        color: '#28a745',
                        marginBottom: '20px'
                    }}>
                        ✅
                    </div>
                    <h1 style={{ color: '#28a745', marginBottom: '20px' }}>
                        Paiement réussi !
                    </h1>
                    <p style={{ color: '#666', marginBottom: '30px' }}>
                        Votre réservation a été confirmée. Vous recevrez un email de confirmation sous peu.
                    </p>
                    
                    {paymentDetails && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '30px',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ marginBottom: '15px' }}>Détails de la réservation</h3>
                            <p><strong>Événement :</strong> {paymentDetails.event_name}</p>
                            <p><strong>Nombre de places :</strong> {paymentDetails.quantity}</p>
                            <p><strong>Montant payé :</strong> {paymentDetails.amount}€</p>
                            <p><strong>Numéro de transaction :</strong> {paymentDetails.transaction_id}</p>
                        </div>
                    )}
                </div>
            )}
            
            <button
                onClick={handleGoToDashboard}
                style={{
                    padding: '12px 30px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Retour au tableau de bord
            </button>
        </div>
    );
};

export default PaymentSuccess;