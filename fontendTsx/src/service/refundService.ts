// fontendTsx/src/service/refundService.ts
import { privateApi } from "../api/api";

/**
 * Service de gestion des remboursements
 */
export const refundService = {
  /**
   * Créer une demande de remboursement
   * @param operationId - ID de l'opération (réservation)
   * @param reason - Raison du remboursement
   */
  create: async (operationId: number | string, reason: string) => {
    const response = await privateApi.post("/remboursements", {
      operation_id: operationId,
      reason,
    });
    return response.data;
  },

  /**
   * Récupérer les demandes de remboursement de l'utilisateur connecté
   */
  getMyRefunds: async () => {
    const response = await privateApi.get("/mes-remboursements");
    return response.data;
  },

  /**
   * Récupérer toutes les demandes de remboursement (Admin)
   */
  getAll: async () => {
    const response = await privateApi.get("/remboursements");
    return response.data;
  },

  /**
   * Traiter une demande de remboursement (Admin)
   * @param id - ID de la demande
   * @param status - Statut (approuvé/rejeté)
   * @param adminNotes - Notes administratives (optionnel)
   */
  process: async (id: number | string, status: "approved" | "rejected", adminNotes?: string) => {
    const response = await privateApi.put(`/remboursements/${id}/traiter`, {
      status,
      admin_notes: adminNotes,
    });
    return response.data;
  },
};
