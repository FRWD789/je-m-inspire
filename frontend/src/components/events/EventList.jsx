// components/events/EventList.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useAuth } from "../../contexts/AuthContext";
import { useEvents } from '../../hooks/useEvents';
import { EditEventForm } from './EditEventForm';
import { MapHandler } from '../maps/mapsHandler';
import { EventImageThumbnail } from './EventImageGallery';

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};
const debugGroup = (...args) => {
  if (DEBUG) console.group(...args);
};
const debugGroupEnd = () => {
  if (DEBUG) console.groupEnd();
};

export const EventList = ({ 
    endpoint = '/api/events', 
    showReserveButton = true, 
    showDeleteButton = false, 
    showEditButton = false,
    showRefundButton = false,
    showMap = true,
    title = "Événements" 
}) => {
    const { events, loading, error, refetch } = useEvents(endpoint);
    const { delete: deleteApi } = useApi();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [editingEvent, setEditingEvent] = useState(null);

    const handleReserve = useCallback((event) => {
        debug('Navigation vers:', `/payment/${event.id}`);
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
        debug('Navigation vers remboursement pour operation_id:', event.operation_id);
        navigate(`/mes-remboursements?operation_id=${event.operation_id}`);
    }, [navigate]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const eventsList = useMemo(() => {
        if (loading) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    fontSize: '16px',
                    color: '#666'
                }}>
                    ⏳ Chargement des événements...
                </div>
            );
        }
        
        if (error) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#e74c3c',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    border: '1px solid #ef5350'
                }}>
                    ❌ {error}
                </div>
            );
        }
        
        if (events.length === 0) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    fontSize: '16px',
                    color: '#999',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <p style={{ margin: 0 }}>Aucun événement disponible pour le moment</p>
                </div>
            );
        }

        const map = document.getElementById('map');

        return (
            <div>
                {/* Carte uniquement si showMap est true */}
                {showMap && events.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                        <MapHandler events={events}></MapHandler>
                    </div>
                )}
                
                {/* Grille d'événements */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '24px'
                }}>
                    {events.map((event, index) => {
                        const isCreator = event.is_creator || false;
                        const isReserved = event.is_reserved || false;
                        const hasPlaces = event.available_places > 0;

                        return (
                            <div id={`event-${event.id}`}
                                key={`${event.id}-${index}`} 
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                }}
                            >
                                {/* Badges en overlay sur l'image */}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    zIndex: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {isCreator && (
                                        <span style={{
                                            padding: '6px 12px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            👑 Créateur
                                        </span>
                                    )}
                                    {isReserved && (
                                        <span style={{
                                            padding: '6px 12px',
                                            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            🎫 Réservé
                                        </span>
                                    )}
                                    {isReserved && event.operation_id && (
                                        <span style={{
                                            padding: '4px 10px',
                                            backgroundColor: 'rgba(156, 39, 176, 0.9)',
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                        }}>
                                            ID: {event.operation_id}
                                        </span>
                                    )}
                                </div>

                                {/* Badge places en haut à droite */}
                                {!hasPlaces && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        zIndex: 10,
                                        padding: '8px 16px',
                                        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}>
                                        ❌ COMPLET
                                    </div>
                                )}

                                {/* Image de l'événement */}
                                <div style={{ position: 'relative' }}>
                                    <EventImageThumbnail images={event.images || []} />
                                </div>

                                {/* Contenu de la carte */}
                                <div style={{ 
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 1
                                }}>
                                    {/* Titre et niveau */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <h3 style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            color: '#1a1a1a',
                                            lineHeight: '1.3',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {event.name}
                                        </h3>
                                        {event.level && (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                backgroundColor: '#f0f4ff',
                                                color: '#3f51b5',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                ⭐ {event.level}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        margin: '0 0 16px 0',
                                        color: '#666',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        flex: 1
                                    }}>
                                        {event.description}
                                    </p>

                                    {/* Infos clés en grille compacte */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '12px',
                                        marginBottom: '16px',
                                        padding: '16px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '18px' }}>📅</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    color: '#999',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Début
                                                </div>
                                                <div style={{ 
                                                    fontSize: '13px', 
                                                    color: '#333',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {formatDate(event.start_date)}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '18px' }}>💰</span>
                                            <div>
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    color: '#999',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Prix
                                                </div>
                                                <div style={{ 
                                                    fontSize: '18px', 
                                                    color: '#27ae60',
                                                    fontWeight: '700'
                                                }}>
                                                    {event.base_price}€
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '18px' }}>👥</span>
                                            <div>
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    color: '#999',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Places
                                                </div>
                                                <div style={{ 
                                                    fontSize: '13px', 
                                                    color: hasPlaces ? '#27ae60' : '#e74c3c',
                                                    fontWeight: '700'
                                                }}>
                                                    {event.available_places}/{event.max_places}
                                                </div>
                                            </div>
                                        </div>

                                        {event.localisation && (
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{ fontSize: '18px' }}>📍</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ 
                                                        fontSize: '11px', 
                                                        color: '#999',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        Lieu
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '13px', 
                                                        color: '#333',
                                                        fontWeight: '600',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {event.localisation.name || 'Non spécifié'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Organisateur si disponible */}
                                    {event.creator && (
                                        <div style={{
                                            padding: '12px',
                                            backgroundColor: '#e3f2fd',
                                            borderRadius: '8px',
                                            marginBottom: '16px',
                                            borderLeft: '3px solid #2196f3'
                                        }}>
                                            <div style={{ 
                                                fontSize: '12px',
                                                color: '#1976d2',
                                                fontWeight: '600',
                                                marginBottom: '4px'
                                            }}>
                                                Organisé par
                                            </div>
                                            <div style={{ 
                                                fontSize: '14px',
                                                color: '#333',
                                                fontWeight: '600'
                                            }}>
                                                {event.creator.name} {event.creator.last_name}
                                            </div>
                                            {event.creator.roles && (
                                                <div style={{ 
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    marginTop: '2px'
                                                }}>
                                                    {event.creator.roles.map(r => r.role).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Boutons d'action */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        marginTop: 'auto'
                                    }}>
                                        {showReserveButton && !isCreator && !isReserved && (
                                            <button
                                                onClick={() => handleReserve(event)}
                                                disabled={!hasPlaces}
                                                style={{
                                                    width: '100%',
                                                    padding: '14px',
                                                    background: hasPlaces 
                                                        ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)'
                                                        : '#95a5a6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    fontSize: '15px',
                                                    fontWeight: '700',
                                                    cursor: hasPlaces ? 'pointer' : 'not-allowed',
                                                    transition: 'all 0.2s',
                                                    boxShadow: hasPlaces ? '0 4px 12px rgba(39, 174, 96, 0.3)' : 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (hasPlaces) {
                                                        e.target.style.transform = 'scale(1.02)';
                                                        e.target.style.boxShadow = '0 6px 16px rgba(39, 174, 96, 0.4)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (hasPlaces) {
                                                        e.target.style.transform = 'scale(1)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
                                                    }
                                                }}
                                            >
                                                {hasPlaces ? '🎫 Réserver maintenant' : '❌ Complet'}
                                            </button>
                                        )}

                                        {(showEditButton || showDeleteButton || showRefundButton) && (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: (showEditButton && showDeleteButton) ? '1fr 1fr' : '1fr',
                                                gap: '8px'
                                            }}>
                                                {showEditButton && isCreator && (
                                                    <button
                                                        onClick={() => setEditingEvent(event)}
                                                        style={{
                                                            padding: '12px',
                                                            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                                    >
                                                        ✏️ Modifier
                                                    </button>
                                                )}

                                                {showDeleteButton && (isCreator || isAdmin) && (
                                                    <button
                                                        onClick={() => handleDelete(event.id, event.name)}
                                                        style={{
                                                            padding: '12px',
                                                            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                                    >
                                                        🗑️ {isAdmin && !isCreator ? 'Supprimer (Admin)' : 'Supprimer'}
                                                    </button>
                                                )}

                                                {showRefundButton && isReserved && event.operation_id && (
                                                    <button
                                                        onClick={() => handleRefund(event)}
                                                        style={{
                                                            padding: '12px',
                                                            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            gridColumn: '1 / -1'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                                    >
                                                        💸 Demander un remboursement
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [events, loading, error, handleReserve, handleDelete, handleRefund, showReserveButton, showDeleteButton, showEditButton, showRefundButton, showMap, formatDate, isAdmin]);

    return (
        <div>
            {title && (
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a1a1a',
                    marginBottom: '24px'
                }}>
                    {title}
                </h2>
            )}
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