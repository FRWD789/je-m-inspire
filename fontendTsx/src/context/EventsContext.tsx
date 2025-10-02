import React, { createContext, useContext, useState, useEffect, useCallback, type JSX } from "react";
import eventService from "@/service/eventService";
import useApi from "@/hooks/useApi";
import { api } from "@/api/api";
import type { Event, CreateEventPayload } from "@/types/event";

// ============================================
// TYPES
// ============================================

interface EventsContextType {
  events: Event[];
  myEvents: Event[];
  loading: boolean;
  myEventsLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchMyEvents: () => Promise<void>;
  addEvent: (payload: CreateEventPayload) => Promise<Event>;
  removeEvent: (id: number) => void;
}

// ============================================
// CONTEXT CREATION
// ============================================

const EventsContext = createContext<EventsContextType | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const privateApi  = useApi();

  // All events (public)
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // User's events (private)
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [reservedEvents, setReservedEvents] = useState<Event[]>([]);
  const [myEventsLoading, setMyEventsLoading] = useState(false);

  // Errors
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH ALL EVENTS (PUBLIC)
  // ============================================

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await eventService.getAll(api);
      setEvents(res.data.events || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Erreur de chargement des événements";
      setError(errorMessage);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // FETCH MY EVENTS (PRIVATE)
  // ============================================

  const refetchMyEvents = async () => {
    try {
      setMyEventsLoading(true);
      setError(null);
      const res = await eventService.myEvents(privateApi);
      // Structure based on your Laravel endpoint response
      const data = res.data;
      console.log(data)
      setMyEvents(data.events || []);
   
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        "Erreur lors de la récupération de vos événements";
      
      setError(errorMessage);
      console.error("Error fetching my events:", err);
    } finally {
      setMyEventsLoading(false);
    }}
  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    refetch();
  }, [refetch]);



  // ============================================
  // ADD EVENT
  // ============================================

  const addEvent = useCallback(
    async (payload: CreateEventPayload) => {
      try {
        setError(null);
        
        const res = await eventService.create(privateApi, payload);
        const newEvent = res.data.event;

        // Optimistic update - add to all events
        setEvents((prev) => [newEvent, ...prev]);
        
        // Add to created events
        setCreatedEvents((prev) => [newEvent, ...prev]);
        setMyEvents((prev) => [newEvent, ...prev]);

        return newEvent;
      } catch (err: any) {
        const errorMessage = 
          err.response?.data?.message || 
          err.message || 
          "Impossible de créer l'événement";
        
        setError(errorMessage);
        throw err; // Re-throw for component-level handling
      }
    },
    [privateApi]
  );

  // ============================================
  // REMOVE EVENT
  // ============================================

  const removeEvent = useCallback((id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setMyEvents((prev) => prev.filter((e) => e.id !== id));
    setCreatedEvents((prev) => prev.filter((e) => e.id !== id));
    setReservedEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: EventsContextType = {
    events,
    myEvents,
    loading,
    myEventsLoading,
    error,
    refetch,
    refetchMyEvents,
    addEvent,
    removeEvent,
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

export function useEventsContext() {
  const ctx = useContext(EventsContext);
  
  if (!ctx) {
    throw new Error("useEventsContext must be used within an EventsProvider");
  }
  
  return ctx;
}