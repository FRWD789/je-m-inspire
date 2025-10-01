// frontend/src/components/events/EventDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EventList } from './EventList';
import { Navigate } from 'react-router-dom';
import { CreateEventForm } from './CreateEventForm';

export const EventDashboard = () => {
  const { isAuthenticated, isInitialized, loading, user, isProfessional } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ✅ CRITIQUE : Attendre que l'auth soit initialisée
  if (!isInitialized || loading) {
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

  // ✅ Rediriger si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Maintenant on peut charger les événements en toute sécurité
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
          {isProfessional() && ' (Professionnel)'}
        </p>
      </div>

      {/* Navigation par onglets */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '1px solid #e0e0e0',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'all' ? '#3498db' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'all' ? 'bold' : 'normal',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s',
            borderBottom: activeTab === 'all' ? '3px solid #3498db' : '3px solid transparent'
          }}
        >
          📋 Tous les événements
        </button>
        
        <button
          onClick={() => setActiveTab('my-events')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'my-events' ? '#3498db' : 'transparent',
            color: activeTab === 'my-events' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'my-events' ? 'bold' : 'normal',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s',
            borderBottom: activeTab === 'my-events' ? '3px solid #3498db' : '3px solid transparent'
          }}
        >
          🎫 Mes événements
        </button>
      </div>

      {/* Bouton créer un événement (si professionnel) */}
      {isProfessional() && activeTab === 'my-events' && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '12px 24px',
              backgroundColor: showCreateForm ? '#e74c3c' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            {showCreateForm ? '❌ Annuler' : '➕ Créer un nouvel événement'}
          </button>
        </div>
      )}

      {/* Formulaire de création (si affiché) */}
      {showCreateForm && isProfessional() && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <CreateEventForm 
            onEventCreated={() => {
              setShowCreateForm(false);
              // Le refetch sera géré automatiquement par EventList
            }}
          />
        </div>
      )}

      {/* Contenu principal basé sur l'onglet actif */}
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
                Événements disponibles
              </h2>
              <p style={{ 
                margin: 0,
                fontSize: '14px',
                color: '#666'
              }}>
                Parcourez tous les événements publics et réservez votre place
              </p>
            </div>
            
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
                Mes événements créés et réservés
              </h2>
              <p style={{ 
                margin: 0,
                fontSize: '14px',
                color: '#666'
              }}>
                Gérez vos événements créés et consultez vos réservations
              </p>
            </div>
            
            <EventList 
              endpoint="/api/my-events" 
              showReserveButton={false}
              showEditButton={isProfessional()}
              showDeleteButton={isProfessional()}
              title=""
            />
          </div>
        )}
      </div>

      {/* Footer informatif */}
      <div style={{
        marginTop: '60px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          💡 <strong>Astuce :</strong> {isProfessional() 
            ? 'En tant que professionnel, vous pouvez créer et gérer vos événements.' 
            : 'Devenez professionnel pour créer vos propres événements !'}
        </p>
        {!isProfessional() && (
          <button
            onClick={() => window.location.href = '/pro-plus'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            🚀 Passer Pro Plus
          </button>
        )}
      </div>
    </div>
  );
};