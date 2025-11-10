import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import EventCard from '../components/EventCard'

import { useEvent } from '@/context/EventContext'
import EventForm from '../components/EventForm'
import { useAuth } from '@/context/AuthContext'

import { ReservationService } from '@/service/ReservationService'
import type { Event } from '@/types/events'
import { usePagination } from '@/hooks/usePagination'


type Tab = 'all' | 'my' | 'reservations'

export default function MyEventPage() {
  const { myEvents,events,fetchEvents ,deleteEvent,fetchMyEvents, loading } = useEvent()
  const [selectedTab, setSelectedTab] = useState<Tab>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { user } = useAuth();

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
 
  const handelClose= ()=>{
    setOpen(false)
    setSelectedEvent(null)
  }
  
  useEffect(() => {
    fetchMyEvents()
  }, [])

  // Categories for filter
   const categories = useMemo(
    () => [...new Set(events.map(e => e.categorie?.name).filter(Boolean))],
    [events]
  )

   const filteredEvents = useMemo(() => {
    let displayEvents = events
    if (selectedTab === 'my') displayEvents = myEvents
    // TODO: replace with reservations
    // Filter by category & search
    return displayEvents.filter(e => {
      const matchesCategory = !selectedCategory || e.categorie?.name === selectedCategory
      const matchesSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.localisation?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedTab, events, myEvents, selectedCategory, searchTerm])
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])
  const handleEdit = (event: Event) => {
      setSelectedEvent(event)
      setOpen(true)
    }

    const { currentData: paginatedEvents, currentPage, totalPages, nextPage, prevPage, goToPage, setCurrentPage } = usePagination(filteredEvents, 6)
  
      useEffect(() => {
      setCurrentPage(1)
    }, [filteredEvents, setCurrentPage])
    return (
    <>
      {/* Tabs + Filter */}
      <div className="space-y-4 sticky top-[76px] backdrop-blur-xl rounded-b-[8px] z-30 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex gap-4 px-4 py-2 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1 rounded-lg ${
              selectedTab === 'all' ? 'bg-accent text-white' : 'text-gray-600'
            }`}
          >
            Tous les événements
          </button>
          {
            user.roles[0].role === "professionnel" &&   <button
            onClick={() => setSelectedTab('my')}
            className={`px-3 py-1 rounded-lg ${
              selectedTab === 'my' ? 'bg-accent text-white' : 'text-gray-600'
            }`}
          >
            Mes événements
          </button>
          }
        
        </div>

        {/* Search + Category + Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 px-4 py-2">
          {/* Search */}
          <div className="flex items-center flex-1 border border-gray-300 rounded-lg px-2 py-1">
            <Search className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full focus:outline-none px-2 text-sm"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Add Event */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg hover:bg-primary"
          >
            <Plus className="w-4 h-4" /> Ajouter un événement
          </button>
        </div>
      </div>

      {/* Event List */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500">Aucun événement trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map(e => (
              <EventCard key={e.id} event={e} onEdit={handleEdit} onDelete={deleteEvent}/>
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 border rounded">
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToPage(idx + 1)}
              className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? 'bg-accent text-white' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={nextPage} disabled={currentPage === totalPages} className="px-3 py-1 border rounded">
            Next
          </button>
        </div>
      )}

       {/* Modal for Create / Edit */}
      {open && (
        <div className="fixed inset-0 z-9999 bg-black/20 backdrop-blur-sm flex justify-end">
          <div ref={menuRef} className="w-full sm:w-[50vw] h-full bg-white px-6 py-8 overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {selectedEvent ? 'Modifier un événement' : 'Créer un événement'}
              </h2>
              <button onClick={handelClose}>
                <Plus className="rotate-45 w-6 h-6" />
              </button>
            </div>
            <EventForm
              type={selectedEvent ? 'edit' : 'create'}
              defaultValues={selectedEvent || undefined}
              onSuccess={handelClose}
              eventId={selectedEvent?selectedEvent.id:undefined}
            />
          </div>
        </div>
      )}
    </>
  )
}
