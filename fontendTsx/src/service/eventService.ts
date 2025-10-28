import type { MyEventsResponse, Event } from "@/types/events";
import { publicApi, privateApi } from "../api/api"; // <-- import privateApi directly

// Types

// Service
export const createEventService = () => {
  const extractData = <T>(response: any): T => response.data?.data || response.data;

  return {
    // Public endpoints
    getAll: async (): Promise<Event[]> => {
      const response = await publicApi.get("/events");
      return extractData<Event[]>(response);
    },

    getById: async (id: string | number): Promise<Event> => {
      const response = await publicApi.get(`/events/${id}`);
      return extractData<Event>(response);
    },

    // Private endpoints
    getMyEvents: async (): Promise<MyEventsResponse> => {
      const response = await privateApi.get("/my-events");
      return response.data
    },

    create: async (eventData: any): Promise<Event> => {
      const response = await privateApi.post("/events", eventData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return extractData<Event>(response);
    },

    update: async (id: string | number, eventData: any): Promise<Event> => {
      const response = await privateApi.post(`/events/${id}`, eventData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return extractData<Event>(response);
    },

    delete: async (id: string | number): Promise<void> => {
      await privateApi.delete(`/events/${id}`);
    },


  };
};

export type EventService = ReturnType<typeof createEventService>;
