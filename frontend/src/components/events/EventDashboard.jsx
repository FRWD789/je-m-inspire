// frontend/src/components/events/EventDashboard.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EventList } from './EventList';
import { CreateEventForm } from './CreateEventForm';

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

export const EventDashboard = () => {
  debug('🎪 EventDashboard: Début du composant');
  
  const { isAuthenticated, isInitialized, loading, user, isProfessional } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isPro = isProfessional();

  debug('🎪 EventDashboard state:', {
    isAuthenticated,
    isInitialized,
    loading,
    userEmail: user?.email,
    isPro: isPro,
    userRoles: user?.roles
  });

  if (loading || !isInitialized) {
    debug('🎪 EventDashboard: En attente d\'initialisation...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    debug('🎪 EventDashboard: Non authentifié, redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  debug('🎪 EventDashboard: Rendu du composant');

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333'
      }}>
        🎪 Tableau de bord des événements
      </h1>

      {/* Onglets de navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => {
            debug('🔄 Changement onglet: all');
            setActiveTab('all');
          }}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'all' ? '#3498db' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'all' ? 'bold' : 'normal',
            borderBottom: activeTab === 'all' ? '3px solid #3498db' : 'none',
            transition: 'all 0.3s'
          }}
        >
          Tous les événements
        </button>

        <button
          onClick={() => {
            debug('🔄 Changement onglet: my-events');
            setActiveTab('my-events');
          }}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'my-events' ? '#3498db' : 'transparent',
            color: activeTab === 'my-events' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'my-events' ? 'bold' : 'normal',
            borderBottom: activeTab === 'my-events' ? '3px solid #3498db' : 'none',
            transition: 'all 0.3s'
          }}
        >
          Mes événements
        </button>

        {isPro && (
          <button
            onClick={() => {
              debug('🚀 Navigation vers /abonnement');
              navigate('/abonnement');
            }}
            style={{
              padding: '12px 24px',
              border: '2px solid #f39c12',
              background: 'linear-gradient(135deg, #f39c12, #e67e22)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              marginLeft: 'auto',
              transition: 'all 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ⭐ Devenir Pro Plus
          </button>
        )}
      </div>

      {/* Bouton créer événement */}
      {isPro && activeTab === 'my-events' && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => {
              debug('🔄 Toggle form:', !showCreateForm);
              setShowCreateForm(!showCreateForm);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: showCreateForm ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            {showCreateForm ? '❌ Annuler' : '➕ Créer un nouvel événement'}
          </button>
        </div>
      )}

      {/* Formulaire de création */}
      {showCreateForm && isPro && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <CreateEventForm 
            onEventCreated={() => {
              debug('✅ Événement créé, fermeture formulaire');
              setShowCreateForm(false);
            }}
          />
        </div>
      )}

      {/* Liste des événements */}
      <div style={{ marginTop: '30px' }}>
        {activeTab === 'all' && (
          <div>
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              borderLeft: '4px solid #2196f3'
            }}>
              <h2 style={{ 
                margin: '0 0 5px 0',
                fontSize: '20px',
                color: '#1976d2'
              }}>
                📅 Événements disponibles
              </h2>
              <p style={{ 
                margin: 0,
                fontSize: '14px',
                color: '#666'
              }}>
                Parcourez tous les événements publics et réservez votre place
              </p>
            </div>
            
            {debug('🔄 Rendu EventList pour /api/events')}
            <EventList 
              endpoint="/api/events" 
              showReserveButton={true}
              showEditButton={false}
              showDeleteButton={false}
              showRefundButton={false}
              showMap={true}  // ✅ Afficher la carte pour tous les événements
              title=""
            />
          </div>
        )}

        {activeTab === 'my-events' && (
          <div>
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#fff3e0',
              borderRadius: '8px',
              borderLeft: '4px solid #ff9800'
            }}>
              <h2 style={{ 
                margin: '0 0 5px 0',
                fontSize: '20px',
                color: '#f57c00'
              }}>
                🎫 Mes événements
              </h2>
              <p style={{ 
                margin: 0,
                fontSize: '14px',
                color: '#666'
              }}>
                Événements que vous avez créés ou auxquels vous participez
              </p>
            </div>
            
            {debug('🔄 Rendu EventList pour /api/my-events')}
            <EventList 
              endpoint="/api/my-events" 
              showReserveButton={false}
              showEditButton={isPro}
              showDeleteButton={isPro}
              showRefundButton={true}
              showMap={false}  // ✅ NE PAS afficher la carte pour "mes événements"
              title=""
            />
          </div>
        )}
      </div>
    </div>
  );
};