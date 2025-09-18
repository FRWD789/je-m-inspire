import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';

export const EventForm = () => {
  const { addEvent } = useEvents();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addEvent({ title, date });
    setTitle('');
    setDate('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button type="submit">Créer l'événement</button>
    </form>
  );
};
