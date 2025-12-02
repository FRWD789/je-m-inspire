import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from './App.tsx'
import { AuthContextProvider } from './context/AuthContext.tsx'
import { CompressedFilesProvider } from './context/CompressedFilesContext'
import { BrowserRouter } from 'react-router-dom'
import './i18n/config'
import * as Sentry from "@sentry/react";

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré:', registration.scope);
        
        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Erreur Service Worker:', error);
      });
  });
}

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://b1d9d8e9d23e1badc7bd505874e4854c@o4510400555384832.ingest.us.sentry.io/4510400624590848",
    environment: "production",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 0.2, // 20% des transactions
    replaysSessionSampleRate: 0.1, // 10% des sessions
    replaysOnErrorSampleRate: 1.0, // 100% si erreur
    beforeSend(event) {
      // Filtrer les erreurs non pertinentes
      if (event.exception) {
        const error = event.exception.values?.[0];
        // Ignorer les erreurs réseau connues
        if (error?.type === 'NetworkError') {
          return null;
        }
      }
      return event;
    },
  });
}

function ErrorFallback() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
        Une erreur est survenue
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        L'équipe technique a été notifiée.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Recharger la page
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
      <BrowserRouter>
        <AuthContextProvider>
          <CompressedFilesProvider>  
            <App />
          </CompressedFilesProvider>
        </AuthContextProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </StrictMode>
);