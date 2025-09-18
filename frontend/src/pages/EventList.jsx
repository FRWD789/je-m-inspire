import React from 'react';
import { useEvents } from '../hooks/useEvents';

export const EventList = () => {
  const { events, loading, removeEvent } = useEvents();

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <h1>Liste des événements</h1>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <strong>{event.title}</strong> - {event.date}
            <button onClick={() => removeEvent(event.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
