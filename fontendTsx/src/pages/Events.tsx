import React from "react";

import { useAuth } from "../context/AuthContext";
import eventService from "../service/eventService";
import EventForm from "../components/EventForm";
import { useEventsContext } from "@/context/EventsContext";

function Events() {
  const { events, loading, error, refetch,removeEvent} = useEventsContext()
  if (loading) return <p>Chargement des événements...</p>;
  if (error) return <p className="text-red-500">Erreur: {error}</p>;

  return (


    <>
    <div >
      <h1 className="text-xl font-bold mb-4">Liste des événements</h1>

      <button
        onClick={refetch}
        className="mb-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🔄 Recharger
      </button>

      {events.length === 0 ? (
        <p>Aucun événement disponible.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="p-3 border rounded shadow-sm hover:bg-gray-50"
            >
              <h2 className="font-semibold">{event.name}</h2>
              <p className="text-sm text-gray-600">
                {event.localisation?.name} — {event.start_date}
              </p>
              <p className="text-sm">{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
    
    </>

  );
}

export default Events;
