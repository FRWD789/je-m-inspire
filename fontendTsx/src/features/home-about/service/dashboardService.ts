import { privateApi } from "@/api/api";

// ✅ Interface pour les données formatées retournées au composant
export interface DashboardStats {
  // Pour professionnels
  best_event_display?: string; // Formaté : "Nom événement (X réservations)"
  
  // Pour tous les utilisateurs
  next_reservation_display?: string; // Formaté : "Nom événement - Dans X jours"
  
  // Pour professionnels (Pro Plus ou gratuit)
  monthly_earnings_display?: string; // Formaté : "XXX.XX $ ce mois"
  
  // Pour admins
  pending_approvals_display?: string; // Formaté : "X en attente"
  
  // Données brutes (si nécessaire pour navigation)
  best_event_id?: number;
  next_reservation_id?: number;
}

// ==========================================
// FONCTIONS DE FORMATAGE
// ==========================================

/**
 * Formate le temps jusqu'à un événement en texte lisible
 */
const formatTimeUntilEvent = (dateString: string, daysUntil?: number): string => {
  if (!dateString) return '-';
  
  // Arrondir vers le haut pour éviter les décimales
  const days = daysUntil !== undefined ? Math.ceil(daysUntil) : null;
  
  if (days !== null) {
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Demain";
    return `${days} jours`;
  }
  
  // Calcul manuel si nécessaire
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  return `${diffDays} jours`;
};

/**
 * Formate le meilleur événement
 */
const formatBestEvent = (data: any): string => {
  if (!data?.name) {
    return 'Aucun événement créé';
  }
  
  const reservationText = data.reservations === 0 
    ? 'Aucune réservation'
    : `${data.reservations} réservations`;
  
  return `${data.name} (${reservationText})`;
};

/**
 * Formate la prochaine réservation
 */
const formatNextReservation = (data: any): string => {
  if (!data?.event_name) return '-';
  
  const timeUntil = formatTimeUntilEvent(data.date, data.days_until);
  return `${data.event_name} - Dans ${timeUntil}`;
};

/**
 * Formate les revenus mensuels
 * ✅ Toujours retourne une valeur, même pour les comptes gratuits
 */
const formatMonthlyEarnings = (earnings: number | undefined): string => {
  if (earnings === undefined || earnings === null) {
    return '0.00 $ ce mois';
  }
  return `${earnings.toFixed(2)} $ ce mois`;
};

/**
 * Formate les approbations en attente
 */
const formatPendingApprovals = (count: number | undefined): string => {
  if (count === undefined) return '-';
  return `${count} en attente`;
};

// ==========================================
// INTERFACE BRUTE DE L'API (non exportée)
// ==========================================
interface RawDashboardStats {
  best_event?: {
    name: string;
    reservations: number;
    event_id: number;
  };
  next_reservation?: {
    event_name: string;
    event_id: number;
    date: string;
    days_until: number;
  };
  monthly_earnings?: number;
  pending_approvals?: number;
}

export const dashboardService = {
  /**
   * ✅ MÉTHODE PRINCIPALE : Récupérer toutes les statistiques du dashboard FORMATÉES
   * Cette méthode fait UN SEUL appel API et retourne les données déjà formatées
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await privateApi.get('/dashboard/stats');
      const raw: RawDashboardStats = response.data;

      // ✅ Formater toutes les données avant de les retourner
      const formattedStats: DashboardStats = {
        next_reservation_display: raw.next_reservation
          ? formatNextReservation(raw.next_reservation)
          : undefined,
        
        // ✅ Garder les IDs pour navigation
        best_event_id: raw.best_event?.event_id,
        next_reservation_id: raw.next_reservation?.event_id,
      };

      // ✅ TOUJOURS inclure best_event_display si l'API a retourné ce champ (même null)
      // Cela permet d'afficher "Aucun événement créé" pour les professionnels
      if ('best_event' in raw) {
        formattedStats.best_event_display = formatBestEvent(raw.best_event);
      }

      // ✅ TOUJOURS inclure monthly_earnings_display si l'API a retourné ce champ (même null)
      // Permet d'afficher "0.00 $ ce mois" pour les professionnels gratuits
      if ('monthly_earnings' in raw) {
        formattedStats.monthly_earnings_display = formatMonthlyEarnings(raw.monthly_earnings);
      }

      // ✅ Inclure pending_approvals_display si présent
      if (raw.pending_approvals !== undefined) {
        formattedStats.pending_approvals_display = formatPendingApprovals(raw.pending_approvals);
      }

      return formattedStats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // ==========================================
  // MÉTHODES FALLBACK (optionnelles)
  // Ces méthodes sont gardées pour compatibilité
  // mais la méthode getStats() est recommandée
  // ==========================================

  /**
   * Récupérer le meilleur événement (pour professionnels)
   * @deprecated Utiliser getStats() à la place
   */
  getBestEvent: async (): Promise<{ name: string; reservations: number } | null> => {
    try {
      const response = await privateApi.get('/my-events');
      const events = response.data.created_events || [];
      
      if (events.length === 0) return null;

      // Trouver l'événement avec le plus de réservations
      const bestEvent = events.reduce((prev: any, current: any) => {
        const prevReservations = (prev.capacity || 0) - (prev.available_places || 0);
        const currentReservations = (current.capacity || 0) - (current.available_places || 0);
        return currentReservations > prevReservations ? current : prev;
      });

      const reservations = (bestEvent.capacity || 0) - (bestEvent.available_places || 0);
      
      return {
        name: bestEvent.name,
        reservations: reservations
      };
    } catch (error) {
      console.error("Error fetching best event:", error);
      return null;
    }
  },

  /**
   * Récupérer la prochaine réservation
   * @deprecated Utiliser getStats() à la place
   */
  getNextReservation: async (): Promise<{ event_name: string; date: string } | null> => {
    try {
      const response = await privateApi.get('/mes-reservations');
      const reservations = response.data.reservations || [];
      
      if (reservations.length === 0) return null;

      // Filtrer les événements futurs et trier par date
      const futureReservations = reservations
        .filter((res: any) => new Date(res.event?.start_date) > new Date())
        .sort((a: any, b: any) => 
          new Date(a.event?.start_date).getTime() - new Date(b.event?.start_date).getTime()
        );

      if (futureReservations.length === 0) return null;

      const nextRes = futureReservations[0];
      return {
        event_name: nextRes.event?.name || 'N/A',
        date: nextRes.event?.start_date || ''
      };
    } catch (error) {
      console.error("Error fetching next reservation:", error);
      return null;
    }
  },

  /**
   * Récupérer les revenus du mois (pour professionnels avec Pro Plus)
   * @deprecated Utiliser getStats() à la place
   */
  getMonthlyEarnings: async (): Promise<number> => {
    try {
      const response = await privateApi.get('/vendor/earnings', {
        params: { period: 'month' }
      });
      
      return response.data.summary?.net_earnings || 0;
    } catch (error) {
      console.error("Error fetching monthly earnings:", error);
      return 0;
    }
  },

  /**
   * Récupérer le nombre de demandes pending (pour admins)
   * @deprecated Utiliser getStats() à la place
   */
  getPendingApprovals: async (): Promise<number> => {
    try {
      const response = await privateApi.get('/admin/approvals', {
        params: { status: 'pending' }
      });
      
      return response.data.stats?.pending || 0;
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      return 0;
    }
  }
};