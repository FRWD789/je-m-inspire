import { createEvent, deleteEvent, getEvents } from '@/service/eventService';
import type { Evenment } from '@/types/events';
import React, { useEffect, useState } from 'react'

function useEvents() {
    const [events, setEvents] = useState<Evenment[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchEvents = async () => {
    setLoading(true);

    const data = await getEvents();
    setEvents(data);
    setLoading(false);
     };
     const addEvent = async (eventData: Event) => {
    const newEvent = await createEvent(eventData);
    setEvents([...events, newEvent]);
    };
    const removeEvent = async (id:number) => {
    await deleteEvent(id);
    setEvents(events.filter(e => e.id !== id));
     };
       useEffect(() => {
    fetchEvents();
  }, []);
 return { events, loading, addEvent, removeEvent, fetchEvents };

}

export default useEvents