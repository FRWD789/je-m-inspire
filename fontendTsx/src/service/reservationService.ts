// fontendTsx/src/service/reservationService.ts
import { privateApi } from "../api/api";

/**
 * Service de gestion des réservations
 */
export const reservationService = {
  /**
   * Créer une réservation pour un événement
   * @param eventId - ID de l'événement
   */
  create: async (eventId: number | string) => {
    const response = await privateApi.post(`/events/${eventId}/reserve`);
    return response.data;
  },

  /**
   * Annuler une réservation via l'ID de l'événement
   * @param eventId - ID de l'événement
   */
  cancelByEventId: async (eventId: number | string) => {
    const response = await privateApi.delete(`/events/${eventId}/reservation`);
    return response.data;
  },

  /**
   * Récupérer toutes les réservations de l'utilisateur connecté
   */
  getMyReservations: async () => {
    const response = await privateApi.get("/mes-reservations");
    return response.data;
  },

  /**
   * Annuler une réservation via l'ID de la réservation (operation_id)
   * @param reservationId - ID de la réservation (operation_id)
   */
  cancel: async (reservationId: number | string) => {
    const response = await privateApi.delete(`/reservations/${reservationId}`);
    return response.data;
  },
};
