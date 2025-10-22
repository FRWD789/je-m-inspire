// fontendTsx/src/service/refundService.ts
import { privateApi } from "../api/api";

/**
 * Service de gestion des remboursements
 */
export const refundService = {
  /**
   * Créer une demande de remboursement
   * @param operationId - ID de l'opération (réservation)
   * @param motif - Raison du remboursement
   * @param montant - Montant à rembourser
   */
  create: async (operationId: number | string, motif: string, montant: number) => {
    const response = await privateApi.post("/remboursements", {
      operation_id: operationId,
      motif,
      montant
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
   * @param statut - Statut ('approuve' | 'refuse')
   * @param commentaireAdmin - Commentaire administratif (optionnel)
   */
  process: async (
    id: number | string, 
    statut: "approuve" | "refuse", 
    commentaireAdmin?: string
  ) => {
    const response = await privateApi.put(`/remboursements/${id}/traiter`, {
      statut,
      commentaire_admin: commentaireAdmin
    });
    return response.data;
  },
};