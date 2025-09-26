import React, { useState, useEffect } from 'react';
import { useApi } from "../../contexts/AuthContext";

export const ReservationList = () => {
    const { get, delete: deleteApi } = useApi();
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

            const response = await get('/api/events/mesReservations');
            console.log('Réponse API:', response);

            const data = response.data || response; // Axios → .data

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
                await deleteApi(`/api/operations/${reservationId}`);
                alert('Réservation annulée avec succès');
                fetchReservations(); // Recharger la liste
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
                <button onClick={fetchReservations} style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2>Mes réservations</h2>

            {/* Statistiques */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        background: '#e3f2fd',
                        padding: '15px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>
                            {stats.total_reservations}
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Total réservations</p>
                    </div>
                    <div style={{
                        background: '#e8f5e8',
                        padding: '15px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#388e3c' }}>
                            {stats.a_venir}
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>À venir</p>
                    </div>
                    <div style={{
                        background: '#fff3e0',
                        padding: '15px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#f57c00' }}>
                            {stats.total_personnes}
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Personnes total</p>
                    </div>
                    <div style={{
                        background: '#f3e5f5',
                        padding: '15px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#7b1fa2' }}>
                            {stats.total_depense}€
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Total dépensé</p>
                    </div>
                </div>
            )}

            {/* Debug info */}
            <div style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '20px',
                fontSize: '12px',
                color: '#666'
            }}>
                <strong>Debug:</strong> {reservations.length} réservation(s) trouvée(s)
            </div>

            {/* Liste des réservations */}
            {reservations.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    <p>Vous n'avez aucune réservation.</p>
                    <small style={{ color: '#666' }}>
                        Les réservations que vous effectuez apparaîtront ici.
                    </small>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {reservations.map((reservation, index) => {
                        console.log('Réservation:', reservation); // Debug
                        const statusColors = getStatusColor(reservation.statut);
                        
                        return (
                            <div key={reservation.id || index} style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: '#fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <h3 style={{ margin: 0, color: '#333' }}>
                                                {reservation.event_name || reservation.event?.name || 'Nom non disponible'}
                                            </h3>
                                            {reservation.statut && (
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: statusColors.bg,
                                                    color: statusColors.color
                                                }}>
                                                    {reservation.statut}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                            <div><strong>Début:</strong> {formatDate(reservation.start_date || reservation.event?.start_date)}</div>
                                            <div><strong>Fin:</strong> {formatDate(reservation.end_date || reservation.event?.end_date)}</div>
                                            <div><strong>Lieu:</strong> {reservation.localisation || reservation.event?.localisation?.name || 'Non spécifié'}</div>
                                            <div><strong>Catégorie:</strong> {reservation.categorie || reservation.event?.categorie?.name || 'Non spécifiée'}</div>
                                            <div><strong>Adultes:</strong> {reservation.adults || 0}</div>
                                            <div><strong>Enfants:</strong> {reservation.children || 0}</div>
                                        </div>

                                        <div style={{
                                            background: '#f8f9fa',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            marginBottom: '10px'
                                        }}>
                                            <strong>
                                                Total: {reservation.prix_total || (reservation.total_personnes * (reservation.prix_unitaire || reservation.event?.base_price))}€
                                            </strong>
                                            <small style={{ display: 'block', color: '#666' }}>
                                                {(reservation.total_personnes || (reservation.adults + reservation.children))} personne(s) × {reservation.prix_unitaire || reservation.event?.base_price}€
                                            </small>
                                        </div>

                                        <small style={{ color: '#666' }}>
                                            Réservé le {formatDate(reservation.date_reservation || reservation.created_at)}
                                        </small>
                                    </div>

                                    <div style={{ marginLeft: '20px' }}>
                                        {(reservation.peut_annuler !== false && reservation.statut !== 'Terminé') && (
                                            <button
                                                onClick={() => handleCancelReservation(reservation.id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Annuler
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};