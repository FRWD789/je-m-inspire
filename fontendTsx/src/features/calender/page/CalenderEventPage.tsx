import React from 'react'
import EventsCalendar from '../components/EventsCalendar'
import { useAuth } from '@/context/AuthContext'
import { useEvent } from '@/context/EventContext'

export default function CalenderEventPage() {
    const {events} = useEvent()
  return (
    <EventsCalendar  events={events} />
  )
}
