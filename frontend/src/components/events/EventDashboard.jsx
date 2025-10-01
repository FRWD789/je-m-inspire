// frontend/src/components/events/EventDashboard.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EventList } from './EventList';
import { CreateEventForm } from './CreateEventForm';

export const EventDashboard = () => {
  console.log('🎪 EventDashboard: Début du composant');
  
  const { isAuthenticated, isInitialized, loading, user, isProfessional } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  console.log('🎪 EventDashboard state:', {
    isAuthenticated,
    isInitialized,
    loading,
    userEmail: user?.email,
    isPro: isProfessional ? isProfessional() : 'undefined',
    activeTab,
    showCreateForm
  });

  if (!isInitialized || loading) {
    console.log('⏳ EventDashboard: En attente initialisation');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ fontSize: '18px', color: '#666' }}>
          Initialisation en cours...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 EventDashboard: Non authentifié, redirect');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ EventDashboard: Rendu du contenu principal');

  const isPro = isProfessional && isProfessional();

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* En-tête */}
      <div style={{
        marginBottom: '30px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0',
          fontSize: '32px',
          color: '#333'
        }}>
          Tableau de bord des événements
        </h1>
        <p style={{ 
          margin: 0,
          color: '#666',
          fontSize: '16px'
        }}>
          Bienvenue, <strong>{user?.name || 'Utilisateur'}</strong> 
          {isPro && ' (Professionnel)'}
        </p>
      </div>

      {/* Onglets */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '1px solid #e0e0e0',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => {
            console.log('🔄 Changement onglet: all');
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
            console.log('🔄 Changement onglet: my-events');
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

        {!isPro && (
          <button
            onClick={() => {
              console.log('🚀 Navigation vers /pro-plus');
              navigate('/pro-plus');
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
              console.log('🔄 Toggle form:', !showCreateForm);
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
              console.log('✅ Événement créé, fermeture formulaire');
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
            
            {console.log('🔄 Rendu EventList pour /api/events')}
            <EventList 
              endpoint="/api/events" 
              showReserveButton={true}
              showEditButton={false}
              showDeleteButton={false}
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
            
            {console.log('🔄 Rendu EventList pour /api/my-events')}
            <EventList 
              endpoint="/api/my-events" 
              showReserveButton={false}
              showEditButton={isPro}
              showDeleteButton={isPro}
              title=""
            />
          </div>
        )}
      </div>
    </div>
  );
};