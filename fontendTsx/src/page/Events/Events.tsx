import { Loader, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EventList from '../../components/events/EventList';
import { useEvent } from '@/context/EventContext';
import { MapEvents } from '@/components/map';

export default function Events() {
  const { loading, events ,fetchEvents} = useEvent();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  useEffect(() => {

    console.log("mounted")
  if (events.length === 0 && !loading) {
    
    console.log("fetch forced")
    fetchEvents(true);
  }
  return(
    console.log("unmounted")
  )
}, []); 
  const handleEventClick = (eventId: number) => {
    setSelectedEventId(eventId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = useMemo(
    () => [...new Set(events.map(e => e.categorie?.name).filter(Boolean))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = !selectedCategory || e.categorie?.name === selectedCategory;
      const matchesSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.localisation?.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 🧭 Global Search & Filter */}
      <div className='sticky space-y-6 top-[76px] backdrop-blur-xl rounded-b-[8px] '>
        <div className="flex flex-col sm:flex-row gap-3       px-4 rounded-[6px] py-[8px] border border-gray-300  bg-white  shadow-sm ">
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
        </div>
  
        {/* 🗺️ Map Section */}
        <div className="rounded-[4px]  bg-white shadow-md">
          <MapEvents
            events={filteredEvents}
            selectedEventId={selectedEventId}
            onEventSelect={setSelectedEventId}
          />
              {/* Events Count */}
        </div>
             <div className="px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
        </h2>
      </div>
      </div>

  
 

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
  );
}
