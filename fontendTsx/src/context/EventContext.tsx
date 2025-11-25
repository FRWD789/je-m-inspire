import usePrivateApi from "@/hooks/usePrivateApi";
import { createEventService } from "@/features/events/service/eventService";
import type { CreateEventData, UpdateEventData,Event } from "@/types/events";
import { createContext, useContext, useEffect, useState } from "react";

interface EventContextType {
  // State
  event: Event | undefined;
  events: Event[];
  myEvents: Event[];
  loading: boolean;  
  // Actions
  fetchEventById: (id: string | number) => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchMyEvents: () => Promise<void>;
  createEvent: (data: CreateEventData) => Promise<Event>;
  updateEvent: (id: string | number, data: UpdateEventData) => Promise<Event>;
  deleteEvent: (id: string | number) => Promise<void>;
}
const EventContext = createContext<EventContextType | undefined>(undefined);
interface EventProviderProps {
  children: React.ReactNode;

}
export default function EventProvider({children }:EventProviderProps) {

  const [event, setEvent] = useState<Event>();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const eventService = createEventService()

  useEffect(()=>{
    fetchEvents()
  },[])
  // --- Actions ---
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventService.getAll();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchMyEvents = async () => {
      setLoading(true);
      try {
        const data = await eventService.getMyEvents();
        setMyEvents(data.created_events || []);
      } catch (err) {
        console.error("Error fetching my events:", err);
      } finally {
        setLoading(false);
      }
    };
      const fetchEventById = async (id: string | number) => {
      setLoading(true);
      try {
        const data = await eventService.getById(id);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event by id:", err);
      } finally {
        setLoading(false);
      }
    };
      const createEvent = async (data: CreateEventData) => {
      setLoading(true);
      try {
        const newEvent = await eventService.create(data);
        setEvents((prev) => [newEvent, ...prev]);
        setMyEvents((prev) => [newEvent, ...prev]);
        return newEvent;
      } finally {
        setLoading(false);
      }
    };
    const updateEvent = async (id: string | number, data: UpdateEventData) => {
      setLoading(true);
      try {
        const updatedEvent = await eventService.update(id, data);
        setEvents((prev) => prev.map((e) =>
                    e.id === id
                    ? (({is_creator,user_role,...rest }) => rest)(updatedEvent) // remove unwanted fields
                    : e
        ));
        setMyEvents((prev) => prev.map((e) => (e.id === id ? updatedEvent : e)));
        if (event?.id === id) setEvent(updatedEvent);
        return updatedEvent;
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
        if (event?.id === id) setEvent(undefined);
      } finally {
        setLoading(false);
      }
    };
  return (
    <EventContext.Provider value={
      { event,
        events,
        myEvents,
        loading,
        fetchEventById,
        fetchEvents,
        fetchMyEvents,
        createEvent,
        updateEvent,
        deleteEvent,}
    }>
      {children}
    </EventContext.Provider>
  )
}

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};






