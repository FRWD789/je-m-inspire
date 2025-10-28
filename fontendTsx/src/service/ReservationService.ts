import { privateApi } from "@/api/api";

export const ReservationService = () => ( {

    reserveEvent : async (eventId:any, quantity:any)=> {
      const res = await privateApi.post(`/events/${eventId}/reserve`, { quantity });
      return res.data;
    },
    cancelReservation : async (eventId:any) =>{
      const res = await privateApi.delete(`/events/${eventId}/reservation`);
      return res.data;
    },
    getMyReservations :async ()=> {
      const res = await privateApi.get("/mes-reservations");
      return res.data;
    }
  
});
