import { privateApi, publicApi } from "../api/api";







export const eventService = {
  // Fetch all events (public)
  getAll: async () => {
    const response = await publicApi.get("/events");
    return response.data;
  },

  // Fetch a single event by ID (public)
  getById: async (id: string | number) => {
    const response = await publicApi.get(`/events/${id}`);
    return response.data;
  },

  // Create a new event (private)
  create: async (eventData: any) => {
    const response = await privateApi.post("/events", eventData);
    return response.data;
  },

  // Update an event by ID (private)
  update: async (id: string | number, eventData: any) => {
    const response = await privateApi.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete an event by ID (private)
  delete: async (id: string | number) => {
    const response = await privateApi.delete(`/events/${id}`);
    return response.data;
  },
};
