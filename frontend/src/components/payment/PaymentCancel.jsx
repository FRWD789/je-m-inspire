// components/payment/PaymentCancel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/');
    };

    const handleRetryPayment = () => {
        // Retourner à la page précédente ou à la liste des événements
        navigate(-1);
    };

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
                fontSize: '48px',
                color: '#ffc107',
                marginBottom: '20px'
            }}>
                ⚠️
            </div>
            
            <h1 style={{ color: '#856404', marginBottom: '20px' }}>
                Paiement annulé
            </h1>
            
            <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.5' }}>
                Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
                <br />
                Vous pouvez essayer à nouveau ou choisir une autre méthode de paiement.
            </p>
            
            <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '30px',
                color: '#856404'
            }}>
                <strong>Note :</strong> Si vous avez fermé la fenêtre de paiement par erreur, 
                vous pouvez retourner à l'événement et réessayer le paiement.
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={handleRetryPayment}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Réessayer le paiement
                </button>
                
                <button
                    onClick={handleGoToDashboard}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: '#6c757d',
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
        </div>
    );
};

export default PaymentCancel;