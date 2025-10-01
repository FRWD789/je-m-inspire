// components/events/EventList.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from "../../contexts/AuthContext";
import { useEvents } from '../../hooks/useEvents';
import { EditEventForm } from './EditEventForm';

export const EventList = ({ 
    endpoint = '/api/events', 
    showReserveButton = true, 
    showDeleteButton = false, 
    showEditButton = false, 
    title = "Événements" 
}) => {
    const { events, loading, error, refetch } = useEvents(endpoint);
    const { delete: deleteApi } = useApi();
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

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleString('fr-FR');
    }, []);

    const eventsList = useMemo(() => {
        if (loading) return <div>Chargement des événements...</div>;
        if (error) return <div style={{ color: 'red' }}>{error}</div>;
        if (events.length === 0) return <p>Aucun événement disponible.</p>;

        return (
            <div style={{ display: 'grid', gap: '20px' }}>
                {events.map(event => (
                    <div key={event.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{event.name}</h3>
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
                                            {event.creator.roles?.join(', ')} • {event.creator.email}
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

                                {showEditButton && (
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

                                {showDeleteButton && (
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
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [events, loading, error, handleReserve, handleDelete, showReserveButton, showDeleteButton, showEditButton, formatDate]);

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