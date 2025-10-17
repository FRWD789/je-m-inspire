import EventList from '@/components/events/EventList'
import FormEvents from '@/components/events/formEvents'
import MapEvents from '@/components/map'
import { useEvent } from '@/context/EventContext'
import { Loader, Plus, Search } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function MyEvents() {
  
    const {loading,myEvents,fetchMyEvents} =  useEvent()
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
        useEffect(() => {
          if (myEvents.length === 0 && !loading) {
            console.log("fetch forced")
            fetchMyEvents(true);
          }

        }, []); 
              
      
      const handleEventClick = (eventId: number) => {
        setSelectedEventId(eventId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };



    
      const categories = useMemo(
        () => [...new Set(myEvents.map(e => e.categorie?.name).filter(Boolean))],
        [myEvents]
      );
    
      const filteredEvents = useMemo(() => {
        return myEvents.filter((e) => {
          const matchesCategory = !selectedCategory || e.categorie?.name === selectedCategory;
          const matchesSearch =
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.localisation?.name.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesCategory && matchesSearch;
        });
      }, [myEvents, selectedCategory, searchTerm]);
    const menuRef = useRef<HTMLDivElement>(null);
    const [open,setOpen] = useState(false)
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
              if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
              }
            }
        
            if (open) document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
          }, [open]);
  return (
    <>
     <div className="space-y-6">
        <div className='sticky space-y-6 top-[76px] backdrop-blur-xl rounded-b-[8px] '>
          <div className="flex flex-col sm:flex-row gap-3 sticky top-0  z-30 px-4 rounded-[6px] py-[8px] border border-gray-300  bg-white  shadow-sm ">
        {/* Search bar */}
        <div className="flex items-center flex-1 ">
          <Search className=" text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full  focus:outline-0 px-2 py-[4px]   border-gray-300  focus:outline-none text-sm"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
          <div onClick={()=>setOpen(true)} className='flex px-[12px] rounded-[4px] py-[8px] items-center bg-text gap-x-[4px] text-background '>
              <p className='text-white'>Ajouter Un evenment</p>
              <Plus className='w-5'/>
          </div>
      </div>

      {/* 🗺️ Map Section */}
      <div className="rounded-[4px] sticky top-[60px] bg-white shadow-md">
        <MapEvents
          events={filteredEvents}
          selectedEventId={selectedEventId}
          onEventSelect={setSelectedEventId}
        />
      </div>

      {/* Events Count */}
      <div className="px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
        </h2>
      </div>
            </div>
      {/* 🧭 Global Search & Filter */}
     

      {/* Events List */}
      <div className="px-4 ">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <EventList
            events={filteredEvents}
            onEventClick={handleEventClick}
            selectedEventId={selectedEventId}
          />
        )}
      </div>
    </div>
 

    {
        open&&
          <div  className='w-full fixed top-0 left-0 z-9999 backdrop-blur-xs h-screen bg-black/20   '>
        
                        <div ref={menuRef} className='px-[24px] py-[32px] h-screen grid gap-y-[24px] absolute top-0 right-0 bg-white '>
        
                           <div className='flex justify-between items-center'>
                                    <h2> Cree votre evenment </h2>
                                    <Plus className='rotate-45' onClick={()=>setOpen(!open)}/>
                                </div> 
                            <div className='max-h-[600px] px-[16px] py-[24px] overflow-y-auto'>
                                <FormEvents type='create' onSuccess={() => setOpen(false)}/>

                            </div>
                          
        
                        </div>
                       
                </div>
 
    }
    
    </>

  )
}
