import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionCancel = () => {
    const navigate = useNavigate();

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
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                ⚠️
            </div>
            <h1 style={{ color: '#856404', marginBottom: '20px' }}>
                Abonnement annulé
            </h1>
            <p style={{ color: '#856404', marginBottom: '30px', fontSize: '18px' }}>
                Vous avez annulé le processus d'abonnement.
                Aucun montant n'a été débité.
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={() => navigate('/abonnement')}
                    style={{
                        padding: '12px 30px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Réessayer
                </button>
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

export default SubscriptionCancel;