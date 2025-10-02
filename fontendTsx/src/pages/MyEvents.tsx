import EventsList from '@/components/EventsList';
import { useEventsContext } from '@/context/EventsContext';
import { Loader } from 'lucide-react';
import React, { useEffect } from 'react'

function MyEvents() {
   const { 
    myEvents, 

    myEventsLoading, 
    refetchMyEvents 
  } = useEventsContext();
  
  useEffect(() => {
    refetchMyEvents(); // Charger au montage
  }, []);
  
  if (myEventsLoading) return <Loader />;
  
  return (
    <>
      <h2>Mes événements créés ({myEvents.length})</h2>
      <EventsList events={myEvents} />
      

    </>
  );
}

export default MyEvents