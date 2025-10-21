import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Outlet } from 'react-router-dom'

export default function PersistLogin() {
  // ✅ Utilisation correcte du nouveau AuthContext
  const { loading, isInitialized } = useAuth();

  // ✅ Le nouveau AuthContext gère déjà le refresh automatiquement
  // Donc on n'a plus besoin de useRefresh ici !

  // Si l'authentification est en cours d'initialisation, afficher un loader
  if (loading || !isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '3rem' }}>🔄</div>
        <p>Chargement de l'application...</p>
      </div>
    );
  }

  // Une fois initialisé, afficher les routes enfants
  return <Outlet />;
}