// components/events/EventDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { EventList } from './EventList';
import { ProfessionalOnly, UserOnly } from '../common/RoleGuard';
import { CreateEventForm } from './CreateEventForm';
import { MyReservations } from '../reservations/MyReservations';

export const EventDashboard = () => {
    const { user, isProfessional, hasRole } = useAuth();
    const [activeTab, setActiveTab] = useState('events');

    const tabStyle = (isActive) => ({
        padding: '10px 20px',
        backgroundColor: isActive ? '#007bff' : '#f8f9fa',
        color: isActive ? 'white' : '#007bff',
        border: '1px solid #007bff',
        cursor: 'pointer',
        marginRight: '5px',
        borderRadius: '4px 4px 0 0'
    });

    return (
        <div style={{ padding: '20px' }}>
            {/* Onglets de navigation */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
                <button
                    onClick={() => setActiveTab('events')}
                    style={tabStyle(activeTab === 'events')}
                >
                    Tous les événements
                </button>
                
                {/* Onglet pour les utilisateurs - Mes réservations */}
                {(hasRole('utilisateur') || hasRole('client')) && (
                    <button
                        onClick={() => setActiveTab('myReservations')}
                        style={tabStyle(activeTab === 'myReservations')}
                    >
                        Mes réservations
                    </button>
                )}
                
                {isProfessional() && (
                    <>
                        <button
                            onClick={() => setActiveTab('create')}
                            style={tabStyle(activeTab === 'create')}
                        >
                            Créer un événement
                        </button>
                        <button
                            onClick={() => setActiveTab('myEvents')}
                            style={tabStyle(activeTab === 'myEvents')}
                        >
                            Mes événements
                        </button>
                    </>
                )}
            </div>

            {/* Contenu des onglets */}
            <div style={{ minHeight: '400px' }}>
                {activeTab === 'events' && (
                    <EventList 
                        title="Événements disponibles" 
                        showReserveButton={!isProfessional()} 
                    />
                )}

                {activeTab === 'create' && (
                    <ProfessionalOnly fallback={<p>Accès réservé aux professionnels</p>}>
                        <div>
                            <h2>Créer un nouvel événement</h2>
                            <CreateEventForm onEventCreated={() => setActiveTab('events')} />
                        </div>
                    </ProfessionalOnly>
                )}

                {activeTab === 'myEvents' && (
                    <ProfessionalOnly fallback={<p>Accès réservé aux professionnels</p>}>
                        <EventList 
                            endpoint="/api/my-events" 
                            title="Mes événements créés"
                            showReserveButton={false} 
                            showDeleteButton={true}
                            showEditButton={true}
                        />
                    </ProfessionalOnly>
                )}

                {activeTab === 'myReservations' && (
                    <UserOnly fallback={<p>Accès réservé aux utilisateurs</p>}>
                        <MyReservations />
                    </UserOnly>
                )}
            </div>
        </div>
    );
};