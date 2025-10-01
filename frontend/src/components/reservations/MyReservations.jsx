// components/reservations/MyReservations.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from "../../contexts/AuthContext";

export const MyReservations = () => {
    const { get, delete: deleteApi } = useApi();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await get('/api/mes-reservations');
            const data = response.data || response;

            setReservations(data.reservations || []);
            setStats(data.stats || null);
        } catch (err) {
            console.error('Erreur lors du chargement des réservations:', err);
            setError(err.response?.data?.error || 'Erreur lors du chargement de vos réservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            try {
                await deleteApi(`/api/reservations/${reservationId}`);
                alert('Réservation annulée avec succès');
                fetchReservations();
            } catch (err) {
                console.error('Erreur lors de l\'annulation:', err);
                alert(err.response?.data?.error || 'Erreur lors de l\'annulation');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const getStatusColor = (statut) => {
        switch(statut) {
            case 'À venir': return { bg: '#e8f5e8', color: '#388e3c' };
            case 'En cours': return { bg: '#fff3e0', color: '#f57c00' };
            case 'Terminé': return { bg: '#f5f5f5', color: '#666' };
            default: return { bg: '#f5f5f5', color: '#666' };
        }
    };

    if (loading) {
        return <div>Chargement de vos réservations...</div>;
    }

    if (error) {
        return (
            <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
                <h3>Erreur</h3>
                <p>{error}</p>
                <button 
                    onClick={fetchReservations} 
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Réessayer
                </button>
                <button 
                    onClick={() => navigate('/events')}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retour aux événements
                </button>
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Aucune réservation</h2>
                <p>Vous n'avez pas encore de réservations.</p>
                <button 
                    onClick={() => navigate('/events')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginTop: '20px'
                    }}
                >
                    Découvrir les événements
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1>Mes réservations</h1>
                <button 
                    onClick={() => navigate('/events')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Retour aux événements
                </button>
            </div>

            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#388e3c' }}>
                            {stats.total}
                        </div>
                        <div style={{ color: '#666' }}>Total réservations</div>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f57c00' }}>
                            {stats.upcoming}
                        </div>
                        <div style={{ color: '#666' }}>À venir</div>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
                            {stats.total_amount}€
                        </div>
                        <div style={{ color: '#666' }}>Montant total</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
                {reservations.map(reservation => {
                    const statusStyle = getStatusColor(reservation.statut);
                    return (
                        <div key={reservation.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: '#fff'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0' }}>{reservation.event_name}</h3>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '5px 15px',
                                        backgroundColor: statusStyle.bg,
                                        color: statusStyle.color,
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        marginBottom: '15px'
                                    }}>
                                        {reservation.statut}
                                    </div>

                                    <div style={{ color: '#666', marginBottom: '10px' }}>
                                        <div><strong>Date:</strong> {formatDate(reservation.event_date)}</div>
                                        <div><strong>Quantité:</strong> {reservation.quantity} place(s)</div>
                                        <div><strong>Montant total:</strong> {reservation.total_amount}€</div>
                                        <div><strong>Réservé le:</strong> {formatDate(reservation.reservation_date)}</div>
                                    </div>
                                </div>

                                {reservation.statut === 'À venir' && (
                                    <button
                                        onClick={() => handleCancelReservation(reservation.id)}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};