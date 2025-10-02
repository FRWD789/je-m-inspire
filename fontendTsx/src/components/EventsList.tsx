import type { Event } from '@/types/event'
import React from 'react'

function EventsList({events}:{events:Event[]}) {
  return (
     <div >
      <h1 className="text-xl font-bold mb-4">Liste des événements</h1>

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
  )
}

export default EventsList