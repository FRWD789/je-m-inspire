// components/events/EventList.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useAuth } from "../../contexts/AuthContext";
import { useEvents } from '../../hooks/useEvents';
import { EditEventForm } from './EditEventForm';
import { MapHandler } from '../maps/mapsHandler';


export const EventList = ({ 
    endpoint = '/api/events', 
    showReserveButton = true, 
    showDeleteButton = false, 
    showEditButton = false,
    showRefundButton = false,
    title = "Événements" 
}) => {
    const { events, loading, error, refetch } = useEvents(endpoint);
    const { delete: deleteApi } = useApi();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [editingEvent, setEditingEvent] = useState(null);

    const handleReserve = useCallback((event) => {
        console.log('Navigation vers:', `/payment/${event.id}`);
        navigate(`/payment/${event.id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (eventId, eventName) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${eventName}" ?`)) {
            try {
                await deleteApi(`/api/events/${eventId}`);
                alert('Événement supprimé avec succès !');
                refetch();
            } catch (error) {
                alert(error.response?.data?.error || 'Erreur lors de la suppression');
            }
        }
    }, [deleteApi, refetch]);

    const handleRefund = useCallback((event) => {
        console.log('Navigation vers remboursement pour operation_id:', event.operation_id);
        navigate(`/mes-remboursements?operation_id=${event.operation_id}`);
    }, [navigate]);

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleString('fr-FR');
    }, []);

    const eventsList = useMemo(() => {
        if (loading) return <div>Chargement des événements...</div>;
        if (error) return <div style={{ color: 'red' }}>{error}</div>;
        if (events.length === 0) return <p>Aucun événement disponible.</p>;

        return (
            <div style={{ display: 'grid', gap: '20px' }}>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                <MapHandler events={events}></MapHandler>
                {events.map(event => {
                    // Déterminer si c'est un événement créé ou réservé
=======
                {events.map((event, index) => {
>>>>>>> Stashed changes
=======
                {events.map((event, index) => {
>>>>>>> Stashed changes
                    const isCreator = event.is_creator || false;
                    const isReserved = event.is_reserved || false;

                    return (
                        <div key={`${event.id}-${index}`} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: '#f9f9f9'
                        }}>                                                    
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, color: '#333' }}>{event.name}</h3>
                                        {isCreator && (
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#4CAF50',
                                                color: 'white',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                Créateur
                                            </span>
                                        )}
                                        {isReserved && (
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#2196F3',
                                                color: 'white',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                Réservé
                                            </span>
                                        )}
                                        {isReserved && event.operation_id && (
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#9c27b0',
                                                color: 'white',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 'bold'
                                            }}>
                                                Réservation #{event.operation_id}
                                            </span>
                                        )}
                                    </div>

                                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>{event.description}</p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        <div><strong>Début:</strong> {formatDate(event.start_date)}</div>
                                        <div><strong>Fin:</strong> {formatDate(event.end_date)}</div>
                                        <div><strong>Prix par place:</strong> {event.base_price}€</div>
                                        <div><strong>Places:</strong> {event.available_places}/{event.max_places}</div>
                                        <div><strong>Niveau:</strong> {event.level}</div>
                                        {event.localisation && (
                                            <div><strong>Lieu:</strong> {event.localisation.name || 'Non spécifié'}</div>
                                        )}
                                    </div>

                                    {event.creator && (
                                        <div style={{ 
                                            backgroundColor: '#e8f4f8', 
                                            padding: '10px', 
                                            borderRadius: '4px',
                                            marginBottom: '15px'
                                        }}>
                                            <strong>Organisé par:</strong> {event.creator.name} {event.creator.last_name}
                                            <br />
                                            <small style={{ color: '#666' }}>
                                                {event.creator.roles?.map(r => r.role).join(', ')} • {event.creator.email}
                                            </small>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {showReserveButton && (
                                        <button
                                            onClick={() => handleReserve(event)}
                                            disabled={event.available_places <= 0}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: event.available_places > 0 ? '#28a745' : '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: event.available_places > 0 ? 'pointer' : 'not-allowed',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {event.available_places > 0 ? 'Réserver' : 'Complet'}
                                        </button>
                                    )}

                                    {showEditButton && isCreator && (
                                        <button
                                            onClick={() => setEditingEvent(event)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#ffc107',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Modifier
                                        </button>
                                    )}

                                    {/* Bouton supprimer - visible pour les créateurs OU les admins sur tous les événements */}
                                    {((showDeleteButton && isCreator) || (isAdmin() && endpoint === '/api/events')) && (
                                        <button
                                            onClick={() => handleDelete(event.id, event.name)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {isAdmin() && !isCreator ? '🔒 Supprimer (Admin)' : 'Supprimer'}
                                        </button>
                                    )}

                                    {/* Bouton de remboursement */}
                                    {showRefundButton && isReserved && event.operation_id && (
                                        <button
                                            onClick={() => handleRefund(event)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#ff9800',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            💸 Demander un remboursement
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [events, loading, error, handleReserve, handleDelete, handleRefund, showReserveButton, showDeleteButton, showEditButton, showRefundButton, formatDate, isAdmin, endpoint]);
<<<<<<< Updated upstream

    console.log("Wesh les events : ");
    console.log(events);
=======
>>>>>>> Stashed changes

    return (
        <div>
            {title && <h2>{title}</h2>}
            {editingEvent && (
                <EditEventForm 
                    event={editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onEventUpdated={() => {
                        setEditingEvent(null);
                        refetch();
                    }}
                />
            )}
            {eventsList}
        </div>
    );
};