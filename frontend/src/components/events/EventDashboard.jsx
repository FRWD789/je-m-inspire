// components/events/EventDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { EventList } from './EventList';
import { ProfessionalOnly, UserOnly, AdminOnly } from '../common/RoleGuard';
import { CreateEventForm } from './CreateEventForm';
import { MyReservations } from '../reservations/MyReservations';
import { CreateRemboursementForm } from '../remboursements/CreateRemboursementForm';
import { MesRemboursements } from '../remboursements/MesRemboursements';
import { AdminRemboursements } from '../remboursements/AdminRemboursements';
import { AdminProfessionnels } from '../admin/AdminProfessionnels';
import { AdminUtilisateurs } from '../admin/AdminUtilisateurs';

export const EventDashboard = () => {
    const { user, isProfessional, hasRole } = useAuth();
    const [activeTab, setActiveTab] = useState('events');

    const tabStyle = (isActive) => ({
        padding: '10px 20px',
        backgroundColor: isActive ? '#50562E' : '#FAF5EE',
        color: isActive ? '#FAF5EE' : '#50562E',
        border: '1px solid #50562E',
        cursor: 'pointer',
        marginRight: '5px',
        borderRadius: '4px 4px 0 0'
    });

    return (
        <div style={{ 
            padding: '20px',
            backgroundColor: '#FAF5EE',
            minHeight: '100vh'
        }}>
            {/* Onglets de navigation */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
                <button
                    onClick={() => setActiveTab('events')}
                    style={tabStyle(activeTab === 'events')}
                >
                    Tous les événements
                </button>
                
                {/* Onglets pour les utilisateurs */}
                {(hasRole('utilisateur') || hasRole('client')) && (
                    <>
                        <button
                            onClick={() => setActiveTab('myReservations')}
                            style={tabStyle(activeTab === 'myReservations')}
                        >
                            Mes réservations
                        </button>
                        <button
                            onClick={() => setActiveTab('createRemboursement')}
                            style={tabStyle(activeTab === 'createRemboursement')}
                        >
                            Demander un remboursement
                        </button>
                        <button
                            onClick={() => setActiveTab('mesRemboursements')}
                            style={tabStyle(activeTab === 'mesRemboursements')}
                        >
                            Mes demandes de remboursement
                        </button>
                    </>
                )}
                
                {/* Onglets pour les professionnels */}
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

                {/* Onglet pour les administrateurs */}
                {hasRole('admin') && (
                    <>
                    <button
                        onClick={() => setActiveTab('adminRemboursements')}
                        style={tabStyle(activeTab === 'adminRemboursements')}
                    >
                        Gérer les remboursements
                    </button>
                    <button
                        onClick={() => setActiveTab('adminRemboursements')}
                        style={tabStyle(activeTab === 'adminRemboursements')}
                    >
                        Remboursements
                    </button>
                    <button
                        onClick={() => setActiveTab('adminProfessionnels')}
                        style={tabStyle(activeTab === 'adminProfessionnels')}
                    >
                        Professionnels
                    </button>
                    <button
                        onClick={() => setActiveTab('adminUtilisateurs')}
                        style={tabStyle(activeTab === 'adminUtilisateurs')}
                    >
                        Utilisateurs
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

                {activeTab === 'createRemboursement' && (
                    <UserOnly fallback={<p>Accès réservé aux utilisateurs</p>}>
                        <CreateRemboursementForm 
                            onSuccess={() => setActiveTab('mesRemboursements')} 
                        />
                    </UserOnly>
                )}

                {activeTab === 'mesRemboursements' && (
                    <UserOnly fallback={<p>Accès réservé aux utilisateurs</p>}>
                        <MesRemboursements />
                    </UserOnly>
                )}

                {activeTab === 'adminRemboursements' && (
                    <AdminOnly fallback={<p>Accès réservé aux administrateurs</p>}>
                        <AdminRemboursements />
                    </AdminOnly>
                )}
                {activeTab === 'adminProfessionnels' && (
                    <AdminOnly fallback={<p>Accès réservé aux administrateurs</p>}>
                        <AdminProfessionnels />
                    </AdminOnly>
                )}

                {activeTab === 'adminUtilisateurs' && (
                    <AdminOnly fallback={<p>Accès réservé aux administrateurs</p>}>
                        <AdminUtilisateurs />
                    </AdminOnly>
                )}
            </div>
        </div>
    );
};