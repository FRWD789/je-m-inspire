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
  // COMMISSIONS
  // ==========================================

  /**
   * Récupérer la liste des commissions
   */
  getCommissions: async () => {
    const response = await privateApi.get("/admin/commissions");
    return response.data;
  },

  /**
   * Récupérer les statistiques des commissions
   */
  getCommissionStatistics: async () => {
    const response = await privateApi.get("/admin/commissions/statistics");
    return response.data;
  },

  /**
   * Mettre à jour une commission
   * @param id - ID de la commission
   * @param data - Données de mise à jour
   */
  updateCommission: async (id: number | string, data: any) => {
    const response = await privateApi.put(`/admin/commissions/${id}`, data);
    return response.data;
  },

  /**
   * Mettre à jour plusieurs commissions en masse
   * @param commissions - Tableau de commissions à mettre à jour
   */
  bulkUpdateCommissions: async (commissions: Array<{ id: number | string; [key: string]: any }>) => {
    const response = await privateApi.post("/admin/commissions/bulk-update", {
      commissions,
    });
    return response.data;
  },
};
