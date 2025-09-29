import useEvents from '@/hooks/useEvents'
import { Loader2 } from 'lucide-react';
import React from 'react'

function Events() {



    const {events,loading,fetchEvents,addEvent} = useEvents()

    console.log(events)

  return (
    <div>
      <h1>Liste des événements</h1>
        {loading ?<Loader2 className="h-5 w-5 animate-spin" />: <ul>
    <li >
        ezarar
          </li></ul>
          
    
     }
     
    </div>
  );
}

export default Events