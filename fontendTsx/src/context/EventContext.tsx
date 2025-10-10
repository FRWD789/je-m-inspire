import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { eventService as createEventService } from "../service/EventService";
import usePrivateApi from "../hooks/usePrivateApi";
import type { AxiosResponse } from "axios";
import { da } from "zod/locales";
import { useAuth } from "./AuthContext";

type Event = {
  id: string | number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: string | number;
  capacity: string | number;
  max_places: string | number;
  level: string;

  priority: string | number;
  localisation_address?: string;
  localisation_lat?: string | number | null | undefined;
  localisation_lng?: string | number | null | undefined;
  localisation_id?: string | number;
  categorie_event_id: string | number;
};

type EventContextType = {
  events: Event[];
  loading: boolean;
  myEvents:any[];
  fetchEvents: () => Promise<void>;
  fetchMyEvents: () => Promise<void>;
  createEvent:  (data: Partial<Event>) => Promise<any>
  updateEvent: (id: string | number, data: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string | number) => Promise<void>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used within an EventProvider");
  return context;
};
type EventProviderProps = {
  children: ReactNode;
};
export const EventProvider = ({ children }: EventProviderProps) => {


  const {user} = useAuth()
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const privateApi = usePrivateApi()
  const eventService = createEventService(privateApi)
  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getMyEvents();
      setMyEvents(data.events);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAll();
      setEvents(data.events);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
    } finally {
      setLoading(false);
    }
  };
  const createEvent = async (data: Partial<Event>) => {
    setLoading(true);
    try {  
      const payload = {
      ...data,
      base_price: Number(data.base_price),
      capacity: Number(data.capacity),
      max_places: Number(data.max_places),
      priority: user?.role ==="professionnel"?1:2,
      localisation_lat: data.localisation_lat ? Number(data.localisation_lat) :  Number("48.8566") ,
      localisation_lng: data.localisation_lng ? Number(data.localisation_lng ) :   Number("2.3522") ,

    };

      const newEvent = await eventService.create(payload);
      console.log(newEvent)
      const creatorUpdatedEvents= {...newEvent.event,is_creator:true}
      setEvents(prev => [...prev, newEvent.event]);
      setMyEvents(prev => [...prev, creatorUpdatedEvents]); 
      return newEvent;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: string | number, data: Partial<Event>) => {
    setLoading(true);
    try {
      const updated = await eventService.update(id, data);

      const creatorUpdatedEvents= {...updated.event,is_creator:true}
      setEvents(prev => prev.map(e => (e.id === id ? updated.event : e)));
      setMyEvents(prev => prev.map(e => (e.id === id ? creatorUpdatedEvents : e)));
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string | number) => {
    setLoading(true);
    try {
      await eventService.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
     fetchMyEvents();

  }, []);

  return (
    <EventContext.Provider value={{ events,myEvents, loading, fetchEvents,fetchMyEvents, createEvent, updateEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
};
