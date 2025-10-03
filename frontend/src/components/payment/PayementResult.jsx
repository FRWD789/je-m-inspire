// components/payment/PaymentResult.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentResult = ({ success = true, message = '' }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            maxWidth: '600px',
            margin: '50px auto',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                fontSize: '72px',
                marginBottom: '20px'
            }}>
                {success ? '✅' : '❌'}
            </div>
            
            <h1 style={{
                fontSize: '28px',
                marginBottom: '15px',
                color: success ? '#28a745' : '#dc3545'
            }}>
                {success ? 'Paiement réussi !' : 'Paiement annulé'}
            </h1>
            
            <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '30px'
            }}>
                {message || (success 
                    ? 'Votre réservation a été confirmée avec succès.'
                    : 'Votre paiement a été annulé. Aucun montant n\'a été débité.'
                )}
            </p>

            <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => navigate('/events')}
                    style={{
                        padding: '12px 30px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Retour aux événements
                </button>

                {success && (
                    <button
                        onClick={() => navigate('/mes-reservations')}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Voir mes réservations
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;