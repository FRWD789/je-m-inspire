import { privateApi } from "@/api/api";

// ✅ EXPORT de l'interface pour utilisation dans les composants
export interface DashboardStats {
  // Pour professionnels
  best_event?: {
    name: string;
    reservations: number;
    event_id: number;
  };
  
  // Pour tous les utilisateurs
  next_reservation?: {
    event_name: string;
    event_id: number;
    date: string;
    days_until: number;
  };
  
  // Pour professionnels avec Pro Plus
  monthly_earnings?: number;
  
  // Pour admins
  pending_approvals?: number;
}

export const dashboardService = {
  /**
   * ✅ MÉTHODE PRINCIPALE : Récupérer toutes les statistiques du dashboard
   * Cette méthode fait UN SEUL appel API qui retourne toutes les stats selon le rôle
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await privateApi.get('/dashboard/stats');
      return response.data;
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