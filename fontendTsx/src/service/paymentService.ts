// fontendTsx/src/service/paymentService.ts
import { privateApi, publicApi } from "../api/api";
import type { AxiosInstance } from "axios";

/**
 * Service de gestion des paiements (Stripe & PayPal)
 */
export const paymentService = {
  /**
   * Créer une session de paiement Stripe
   * @param eventId - ID de l'événement à payer
   * @param quantity - Nombre de places (optionnel, défaut: 1)
   */
  stripeCheckout: async (eventId: number | string, quantity: number = 1) => {
    const response = await privateApi.post("/stripe/checkout", {
      event_id: eventId,
      quantity,
    });
    return response.data;
  },

  /**
   * Créer une commande PayPal
   * @param eventId - ID de l'événement à payer
   * @param quantity - Nombre de places (optionnel, défaut: 1)
   */
  paypalCheckout: async (eventId: number | string, quantity: number = 1) => {
    const response = await privateApi.post("/paypal/checkout", {
      event_id: eventId,
      quantity,
    });
    return response.data;
  },

  /**
   * Récupérer le statut d'un paiement
   * @param sessionId - Session ID Stripe (optionnel)
   * @param paymentId - Payment ID PayPal (optionnel)
   */
  getPaymentStatus: async (params: { session_id?: string; payment_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.session_id) queryParams.append("session_id", params.session_id);
    if (params.payment_id) queryParams.append("payment_id", params.payment_id);

    const response = await publicApi.get(`/payment/status?${queryParams.toString()}`);
    return response.data;
  },
};
