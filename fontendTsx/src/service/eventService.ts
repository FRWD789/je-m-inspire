import { api, privateApi } from "@/api/api";


const API_URL="/events"


export const getEvents = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const createEvent = async (eventData:Event) => {
  const response = await privateApi.post(API_URL, eventData);
  return response.data;
};

export const updateEvent = async (id:number, eventData:Partial<Event>) => {
  const response = await privateApi.put(`${API_URL}/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id:number) => {
  const response = await privateApi.delete(`${API_URL}/${id}`);
  return response.data;
};
