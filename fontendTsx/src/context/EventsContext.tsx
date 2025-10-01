import React, { createContext, useContext, useState, useEffect } from "react"
import eventService from "@/service/eventService"
import { useAuth } from "./AuthContext"
import type { CreateEventPayload } from "@/types/event"
import useApi from "@/hooks/useApi"
import { api } from "@/api/api"
import type { Event } from "@/types/event"
interface EventsContextType {
  events: Event[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addEvent: (payload: CreateEventPayload) => Promise<void>
  removeEvent: (id: number) => void
}

const EventsContext = createContext<EventsContextType | null>(null)



export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { privateApi } = useApi(); // ✅ we get both instances
 

  const refetch = async () => {
    try {
      setLoading(true);
      const res = await eventService.getAll(api); // public API
      setEvents(res.data.events); // match your DTO shape
    } catch (err: any) {
      setError(err.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const addEvent = async (payload: CreateEventPayload) => {
    try {
      const res = await eventService.create(privateApi, payload);
      console.log(res.data.event)
      setEvents((prev) => [res.data.event, ...prev]); // optimistic update
    } catch (err: any) {
      setError(err.message ?? "Impossible de créer l’événement");
    }
  };

  const removeEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EventsContext.Provider
      value={{ events, loading, error, refetch, addEvent, removeEvent }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEventsContext must be used inside EventsProvider");
  return ctx;
}