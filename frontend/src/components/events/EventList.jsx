import React from 'react';
import { useEvents } from '../hooks/useEvents';

export const EventList = () => {
  const { events, loading, removeEvent } = useEvents();

  if (loading) return <p>Chargement des événements...</p>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div>
      <h1>Liste des événements</h1>
      
      {events.length === 0 ? (
        <p>Aucun événement disponible.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Prix de base</th>
              <th>Capacité</th>
              <th>Places max</th>
              <th>Places disponibles</th>
              <th>Niveau</th>
              <th>Priorité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td><strong>{event.name}</strong></td>
                <td>{event.description}</td>
                <td>{formatDate(event.start_date)}</td>
                <td>{formatDate(event.end_date)}</td>
                <td>{formatPrice(event.base_price)}</td>
                <td>{event.capacity}</td>
                <td>{event.max_places}</td>
                <td>{event.available_places}</td>
                <td>{event.level}</td>
                <td>{event.priority}</td>
                <td>
                  <button onClick={() => removeEvent(event.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <p>Total: {events.length} événement(s)</p>
    </div>
  );
};