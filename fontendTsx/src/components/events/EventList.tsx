import { CalendarDays, MapPin, Plus, Users } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import Card from '../ui/card'
import { useEffect, useRef, useState } from 'react';
import FormEvents from './formEvents';
import Button from '../ui/button';
import EventCard from './EventCard';
type EventListProps ={
  events:any
}


export default function EventList({events}:EventListProps) {

    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setSelectedEvent(null);
          }
        }
    
        if (selectedEvent) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, [selectedEvent]);

  return(
<>
    
  <div className='overflow-y-auto max-h-[calc(90vh-120px)] grid gap-y-[16px] py-[24px]'>
      {events.map(event => (
    <EventCard
      key={event.id}
      event={event}
      onEdit={setSelectedEvent}
    />
  ))}
  </div>
   {
        selectedEvent&&
        <div  className='w-full fixed top-0 left-0 h-screen bg-black/20   '>

                <div ref={menuRef}  className='px-[24px] py-[32px] h-screen grid gap-y-[24px] absolute top-0 right-0 bg-white '>

                    <div className='flex justify-between items-center'>
                        <h2>   Modifier l’événement : {selectedEvent.name} </h2>
                        <Plus className='rotate-45' onClick={()=>setSelectedEvent(null)}/>
                  </div> 
                  <div className='max-h-[600px] px-[16px] py-[24px] overflow-y-auto'>
                      <FormEvents onSuccess={() => setSelectedEvent(null)} type='edit'  eventId={selectedEvent.id} defaultValues={selectedEvent}/>

                  </div>
                  

                </div>
               
        </div>
    }
  
</>
)

}
