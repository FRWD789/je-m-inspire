import type { AxiosInstance } from "axios";
import type{
  Event,
  CreateEventPayload,
  ReservationPayload,
} from "@/types/event";

const eventService = {
  // Récupérer tous les événements
  getAll: (api: AxiosInstance) =>
    api.get<{ events: Event[]; total: number }>("/events"),

  // Récupérer un événement par ID
  getById: (api: AxiosInstance, id: number) =>
    api.get<{ event: Event }>(`/events/${id}`),

  // Créer un événement
  create: (api: AxiosInstance, payload: CreateEventPayload) =>
    api.post<{ event: Event; message:string }>("/events", payload),

  // Réserver une place
  reserve: (api: AxiosInstance, id: number, payload: ReservationPayload) =>
    api.post(`/events/${id}/reserve`, payload),

  // Annuler une réservation
  cancelReservation: (api: AxiosInstance, id: number) =>
    api.delete(`/events/${id}/cancel-reservation`),

  // Mes événements (créés et réservés)
  myEvents: (api: AxiosInstance) => api.get<{events:Event[]}>("/my-events"),

  // Supprimer un événement
  deleteEvent: (api: AxiosInstance, id: number) =>
    api.delete(`/events/${id}`),

  // Mettre à jour un événement
  updateEvent: (api: AxiosInstance, id: number, payload: Partial<CreateEventPayload>) =>
    api.put<Event>(`/events/${id}`, payload),
};

export default eventService;