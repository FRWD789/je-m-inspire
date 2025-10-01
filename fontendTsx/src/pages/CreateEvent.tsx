import { PoupCard } from '@/dashboard/PoupCard'
import React from 'react'
import Events from './Events'
import EventForm from '@/components/EventForm'

function CreateEvent() {
  return (
    <>
    <PoupCard>
        <EventForm/>
    </PoupCard>
    <Events/>
    </>
  )
}

export default CreateEvent