import { CalendarDays, MapPin, Users } from 'lucide-react'
import { useEvent } from '../../context/EventContext'

export default function EventList() {

    const {events,loading} = useEvent()

    console.log(events[1])
 return loading
  ?
  <p>Loading....</p>
  :
  <div className='grid gap-y-[16px]'>
    {events.map(event=>(
          <div className="w-full  overflow-hidden rounded-[8px] bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Header image */}
      <div className="relative h-48 bg-gradient-to-r from-green-200 to-green-100 flex items-center justify-center">
        <span className="absolute top-3 left-3 bg-white/80 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
          {event.categorie_event_id}
        </span>
        <h2 className="text-2xl font-semibold text-gray-800 text-center px-4">
          {event.name}
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {event.description}
        </p>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-green-600" />
            <span>
              {event.start_date} – {event.end_date}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span>{event.localisation_address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span>{event.max_places} places disponibles</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 p-6 bg-gray-50">
        <div>
          <p className="text-sm text-gray-500">À partir de</p>
          <p className="text-xl font-semibold text-gray-800">
            {event.base_price}$
          </p>
        </div>
    
      </div>
    </div>
    ))}
  </div>

}
