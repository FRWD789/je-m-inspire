// fontendTsx/src/service/adminService.ts
import { privateApi } from "../api/api";

/**
 * Service d'administration (approbations + commissions)
 */
export const adminService = {
  // ==========================================
  // APPROBATIONS
  // ==========================================

  /**
   * Récupérer la liste des professionnels selon leur statut
   * @param status - 'pending' | 'approved' | 'rejected' | 'all'
   */
  getApprovals: async (status?: "pending" | "approved" | "rejected" | "all") => {
    const params = status ? { status } : {};
    const response = await privateApi.get("/admin/approvals", { params });
    return response.data;
  },

  /**
   * Approuver un professionnel
   * @param id - ID de l'utilisateur
   */
  approveProfessional: async (id: number | string) => {
    const response = await privateApi.post(`/admin/approvals/${id}/approve`);
    return response.data;
  },

  /**
   * Rejeter un professionnel
   * @param id - ID de l'utilisateur
   * @param reason - Raison du rejet
   */
  rejectProfessional: async (id: number | string, reason: string) => {
    const response = await privateApi.post(`/admin/approvals/${id}/reject`, {
      rejection_reason: reason,
    });
    return response.data;
  },

 // ==========================================
  // COMMISSIONS - NOUVELLES MÉTHODES
  // ==========================================

  /**
   * Récupérer les paiements où le professionnel n'a PAS reçu directement
   */
  getPendingTransfers: async () => {
    const response = await privateApi.get("/admin/commissions/pending-transfers");
    return response.data;
  },

  /**
   * Récupérer tous les professionnels avec leur taux de commission
   */
  getProfessionals: async () => {
    const response = await privateApi.get("/admin/commissions/professionals");
    return response.data;
  },

  /**
   * Mettre à jour le taux de commission d'un professionnel
   * @param userId - ID de l'utilisateur
   * @param commissionRate - Nouveau taux de commission (0-100)
   */
  updateCommissionRate: async (userId: number | string, commissionRate: number) => {
    const response = await privateApi.put(`/admin/commissions/professionals/${userId}`, {
      commission_rate: commissionRate,
    });
    return response.data;
  },

  /**
   * Mettre à jour plusieurs taux de commission en masse
   * @param updates - Tableau des mises à jour
   */
  bulkUpdateCommissionRates: async (updates: Array<{ user_id: number; commission_rate: number }>) => {
    const response = await privateApi.post("/admin/commissions/bulk-update-rates", {
      updates,
    });
    return response.data;
  },
};
