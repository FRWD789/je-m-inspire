import { useState, useEffect } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  const addEvent = async (eventData) => {
    const newEvent = await createEvent(eventData);
    setEvents([...events, newEvent]);
  };

  const editEvent = async (id, eventData) => {
    const updatedEvent = await updateEvent(id, eventData);
    setEvents(events.map(e => e.id === id ? updatedEvent : e));
  };

  const removeEvent = async (id) => {
    await deleteEvent(id);
    setEvents(events.filter(e => e.id !== id));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, addEvent, editEvent, removeEvent, fetchEvents };
};
