import { Loader, Plus } from 'lucide-react'
import React, { useState } from 'react'
import FormEvents from '../../components/events/formEvents'
import EventList from '../../components/events/EventList'
import { useEvent } from '@/context/EventContext'

export default function Events() {
    const {loading,events} =  useEvent()
  return (
    <>
    <div>
       <h2>Nombre des Evenment {events.length}</h2>
        <div>
            {loading?<Loader className='animate-spin'/> :<EventList events={events}/>}
      
        </div>

    </div>

    

    
    </>

  )
}
