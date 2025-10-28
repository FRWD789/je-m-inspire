import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Menu, Search, X } from 'lucide-react';
import { MapEvents } from '@/components/map';
import EventList from '@/components/events/EventList';
import { useEvent } from '@/context/EventContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PublicEvents() {
  const location = useLocation();
  const { events, loading } = useEvent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const getCity = (address: string) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts.length >= 2 ? parts[1].trim() : parts[0].trim();
  };

  const cities = useMemo(
    () => [...new Set(events.map(e => getCity(e.localisation?.address)).filter(Boolean))],
    [events]
  );

  const categories = useMemo(
    () => [...new Set(events.map(e => e.categorie?.name).filter(Boolean))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    let list = events.filter((e) => {
      const matchesCategory = !selectedCategory || e.categorie?.name === selectedCategory;
      const matchesSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !selectedCity || e.localisation?.address?.includes(selectedCity);
      const matchesPrice = (!minPrice || e.base_price >= minPrice) && (!maxPrice || e.base_price <= maxPrice);

      const eventDate = new Date(e.start_date);
      const now = new Date();

      const matchesDate = (() => {
        if (selectedDateFilter === 'today') return eventDate.toDateString() === now.toDateString();
        if (selectedDateFilter === 'week') {
          const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff < 7;
        }
        if (selectedDateFilter === 'month')
          return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        return true;
      })();

      return matchesCategory && matchesSearch && matchesCity && matchesPrice && matchesDate;
    });

    if (priceSort === 'asc') list.sort((a, b) => a.base_price - b.base_price);
    if (priceSort === 'desc') list.sort((a, b) => b.base_price - a.base_price);

    return list;
  }, [events, selectedCategory, searchTerm, selectedCity, minPrice, maxPrice, selectedDateFilter, priceSort]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const city = params.get('city') || '';
    setSearchTerm(search);
    setSelectedCity(city);
  }, [location.search]);

  return (
    <div className="relative flex w-full h-[70vh] overflow-hidden">
      {/* 🔹 Sidebar */}
      {showSidebar ? (
        <div className="absolute z-40 top-0 left-0 lg:relative lg:w-1/3 w-full h-full flex flex-col bg-white/70 backdrop-blur-2xl border-r border-accent/30 shadow-lg rounded-none lg:rounded-l-xl overflow-hidden">
          {/* Top Bar: Search + Close */}
          <div className="flex items-center justify-between p-4 border-b border-accent/40 bg-white/80 backdrop-blur-lg">
            <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-md px-3 py-2">
              <Search className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-sm bg-transparent focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 ml-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <Filter size={20} />
              </button>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b bg-gray-50 space-y-4 overflow-y-auto max-h-[40vh]">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Ville</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tri par prix</label>
                <div className="flex gap-2 text-sm text-gray-700">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="sort"
                      value="asc"
                      checked={priceSort === 'asc'}
                      onChange={(e) => setPriceSort(e.target.value)}
                    />{' '}
                    ↑
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="sort"
                      value="desc"
                      checked={priceSort === 'desc'}
                      onChange={(e) => setPriceSort(e.target.value)}
                    />{' '}
                    ↓
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Prix max (€)</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{maxPrice} €</p>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedCity('');
                  setSearchTerm('');
                  setSelectedDateFilter('all');
                  setPriceSort('');
                  setMinPrice(0);
                  setMaxPrice(500);
                  setShowFilters(false);
                }}
                className="w-full py-2 mt-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition"
              >
                Réinitialiser
              </button>
            </div>
          )}

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <p className="text-center text-gray-500 mt-20">Chargement...</p>
            ) : filteredEvents.length === 0 ? (
              <p className="text-center text-gray-500 mt-20">Aucun événement trouvé</p>
            ) : (
              <EventList
                events={filteredEvents}
                onEventClick={(id) => navigate(`/events/${id}`)}
                selectedEventId={selectedEventId}
              />
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute z-40 top-5 left-5 bg-white/90 border border-accent text-accent shadow-lg rounded-full p-3 hover:bg-gray-100 transition"
        >
          <Menu size={22} />
        </button>
      )}

      {/* 🔹 Map (Fullscreen behind sidebar) */}
      <div className="flex-1 fixed inset-0  w-full h-full overflow-hidden">
        <MapEvents
          events={filteredEvents}
          selectedEventId={selectedEventId}
          onEventSelect={setSelectedEventId}
        />
      </div>
    </div>
  );
}
