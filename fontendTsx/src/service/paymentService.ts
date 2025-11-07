import {  privateApi } from "../api/api"; // <-- import privateApi directly


export const PayementService = () => ( {
    createStripeCheckout : async (eventId)=> {
      const res = await privateApi.post("/stripe/checkout", { event_id: eventId });
      return res.data// redirige vers Stripe
    },
    createPaypalCheckout : async (eventId) =>{
      const res = await privateApi.post("/paypal/checkout", { event_id: eventId });
        return res.data// redirige vers Stripe
    },
    getPaymentStatus :async ({payment_id, session_id })=> {
      const res = await privateApi.get("/payment/status", {
        params: { payment_id, session_id },
      });
      return res.data;
    }
  
});


