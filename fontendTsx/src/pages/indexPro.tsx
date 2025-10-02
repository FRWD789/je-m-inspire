import EventsList from '@/components/EventsList';
import { useEventsContext } from '@/context/EventsContext'
import React, { useEffect } from 'react'

export default function IndexPro() {
    const {myEvents,myEventsLoading,error,refetchMyEvents} = useEventsContext()
      useEffect(() => {
        refetchMyEvents(); // Charger au montage
      }, []);

//        if (myEventsLoading) return <p>Chargement des événements...</p>;
//   if (error) return <p className="text-red-500">Erreur: {error}</p>;

  return (
    <>
        <div>
            <div className="p-6 w-fit h-fit border rounded shadow-sm hover:bg-gray-50">
                <h2 className="font-semibold">Mes événements créés {myEvents.length}</h2>       
            </div>
            <EventsList events={myEvents} />
        </div>
  
    </>)

}
