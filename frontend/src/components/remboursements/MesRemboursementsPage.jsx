// frontend/src/components/remboursements/MesRemboursementsPage.jsx
import React, { useState } from 'react';
import { CreateRemboursementForm } from './CreateRemboursementForm';
import { MesRemboursements } from './MesRemboursements';

const MesRemboursementsPage = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        // Force le rafraîchissement de la liste des remboursements
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* En-tête */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <h1 style={{
                        color: '#50562E',
                        fontSize: '32px',
                        marginBottom: '10px'
                    }}>
                        💸 Mes Remboursements
                    </h1>
                    <p style={{
                        color: '#666',
                        fontSize: '16px'
                    }}>
                        Gérez vos demandes de remboursement pour vos réservations
                    </p>
                </div>

                {/* Formulaire de création */}
                <div style={{ marginBottom: '40px' }}>
                    <CreateRemboursementForm onSuccess={handleSuccess} />
                </div>

                {/* Liste des remboursements existante */}
                <div>
                    <MesRemboursements key={refreshKey} />
                </div>
            </div>
        </div>
    );
};

export default MesRemboursementsPage;