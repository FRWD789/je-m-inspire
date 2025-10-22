// fontendTsx/src/context/EventContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { eventService as createEventService } from "../service/EventService";
import { privateApi } from "../api/api"; // ✅ Import direct
import { useAuth } from "./AuthContext"; // ✅ On garde useAuth pour user

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
  event: Event | undefined;
  events: Event[];
  loading: boolean;
  myEvents: any[];
  fetchEventById: (id: any) => Promise<void>;
  fetchEvents: (force: boolean) => Promise<void>;
  fetchMyEvents: (force: boolean) => Promise<void>;
  createEvent: (data: Partial<Event>) => Promise<any>;
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
  const { user } = useAuth();
  // ✅ Utiliser directement privateApi importé (pas useApi)
  
  const [event, setEvent] = useState<Event>();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const eventService = createEventService(privateApi); // ✅ privateApi avec bon baseURL
  const [lastEventsFetch, setLastEventsFetch] = useState<number>(0);
  const [lastMyEventsFetch, setLastMyEventsFetch] = useState<number>(0);

  const fetchEventById = async (id: any) => {
    setLoading(true);
    try {
      const data = await eventService.getById(id);
      console.log(data);
      setEvent(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
    } finally {
      setLoading(false);
    }
  };

  const STALE_TIME = 3 * 60 * 1000; // 3 minutes cache

  const fetchMyEvents = async (force = false) => {
    const isStale = Date.now() - lastMyEventsFetch > STALE_TIME;
    if (!force && !isStale && myEvents.length > 0) {
      return;
    }
    setLoading(true);
    try {
      const data = await eventService.getMyEvents();
      setMyEvents(data.created_events);
      setLastMyEventsFetch(Date.now());
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (force = false) => {
    const isStale = Date.now() - lastEventsFetch > STALE_TIME;
    if (!force && !isStale && events.length > 0) {
      return;
    }
    setLoading(true);
    try {
      const data = await eventService.getAll();
      setLastEventsFetch(Date.now());
      setEvents(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: Partial<Event>) => {
    setLoading(true);

    console.log(data);
    try {
      const newEvent = await eventService.create(data);
      console.log(newEvent);
      const creatorUpdatedEvents = { ...newEvent, is_creator: true };
      setEvents((prev) => [...prev, newEvent]);
      setMyEvents((prev) => [...prev, creatorUpdatedEvents]);
      setLastEventsFetch(Date.now());
      setLastMyEventsFetch(Date.now());

      return newEvent;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: string | number, data: Partial<Event>) => {
    setLoading(true);
    try {
      const updated = await eventService.update(id, data);
      const creatorUpdatedEvents = { ...updated, is_creator: true };
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setMyEvents((prev) => prev.map((e) => (e.id === id ? creatorUpdatedEvents : e)));
      setLastEventsFetch(Date.now());
      setLastMyEventsFetch(Date.now());
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string | number) => {
    setLoading(true);
    try {
      await eventService.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setMyEvents((prev) => prev.filter((e) => e.id !== id));
      setLastEventsFetch(Date.now());
      setLastMyEventsFetch(Date.now());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchMyEvents();
    }
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEvents();
        if (user) fetchMyEvents();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  return (
    <EventContext.Provider
      value={{
        event,
        events,
        myEvents,
        loading,
        fetchEventById,
        fetchEvents,
        fetchMyEvents,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};